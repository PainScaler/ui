import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Refresh } from "@/shared/api/api.gen";
import { routes, type Route, type RouteGroup } from "@/router";
import { useUIStore } from "@/shared/stores/uiStore";
import type { PaletteAction } from "./types";

function flattenPages(input: (Route | RouteGroup)[]): PaletteAction[] {
  const out: PaletteAction[] = [];
  const walk = (list: (Route | RouteGroup)[], parent?: string) => {
    for (const r of list) {
      if ("children" in r) {
        walk(r.children, r.label);
      } else {
        out.push({
          id: "page:" + r.path,
          label: r.label,
          description: parent ? `${parent} / ${r.label}` : r.path,
          keywords: [r.path.replace(/^\//, "")],
          group: "Pages",
          onSelect: () => undefined,
        });
      }
    }
  };
  walk(input);
  return out;
}

const STATIC_PAGES = flattenPages(routes);

interface Deps {
  close: () => void;
}

export function usePaletteActions({ close }: Deps): PaletteAction[] {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setColorMode = useUIStore((s) => s.setColorMode);

  return useMemo(() => {
    const pages: PaletteAction[] = STATIC_PAGES.map((p) => ({
      ...p,
      onSelect: () => {
        void navigate(p.id.replace(/^page:/, ""));
        close();
      },
    }));

    const commands: PaletteAction[] = [
      {
        id: "cmd:refresh",
        label: "Refresh cache",
        description: "Reload all ZPA data from the tenant",
        keywords: ["reload", "sync", "fetch"],
        group: "Commands",
        onSelect: () => {
          close();
          void (async () => {
            try {
              await Refresh();
              await queryClient.invalidateQueries();
            } catch (e) {
              console.error("refresh failed", e);
            }
          })();
        },
      },
      {
        id: "cmd:theme-light",
        label: "Theme: Light",
        keywords: ["color", "mode", "appearance"],
        group: "Commands",
        onSelect: () => { setColorMode("light"); close(); },
      },
      {
        id: "cmd:theme-dark",
        label: "Theme: Dark",
        keywords: ["color", "mode", "appearance"],
        group: "Commands",
        onSelect: () => { setColorMode("dark"); close(); },
      },
      {
        id: "cmd:theme-system",
        label: "Theme: System",
        keywords: ["color", "mode", "appearance", "auto"],
        group: "Commands",
        onSelect: () => { setColorMode("system"); close(); },
      },
    ];

    return [...pages, ...commands];
  }, [navigate, queryClient, setColorMode, close]);
}
