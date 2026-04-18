import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Divider,
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  SearchInput,
} from "@patternfly/react-core";
import { Search as SearchApi } from "@/shared/api/api.gen";
import { index } from "@/shared/api/models.gen";
import { usePaletteStore } from "@/shared/stores/paletteStore";
import { usePaletteActions } from "./usePaletteActions";
import { filterAndRank } from "./scorer";
import type { PaletteAction, PaletteGroup } from "./types";
import "./CommandPalette.css";

const RESOURCE_ROUTE: Record<string, string> = {
  segment: "/segments",
  segment_group: "/segment-groups",
  policy: "/policies",
  server_group: "/server-groups",
};

const RESOURCE_LABEL: Record<string, string> = {
  segment: "Segment",
  segment_group: "Segment Group",
  policy: "Policy",
  server_group: "Server Group",
};

const BACKEND_DEBOUNCE_MS = 250;
const MAX_STATIC = 12;
const MAX_RESOURCES = 20;
const GROUP_ORDER: PaletteGroup[] = ["Pages", "Commands", "Resources"];

function useGlobalHotkey() {
  const toggle = usePaletteStore((s) => s.toggle);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);
}

function useBackendResources(query: string, enabled: boolean) {
  const [results, setResults] = useState<index.SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const t = setTimeout(() => {
      SearchApi(trimmed)
        .then((r) => {
          if (!cancelled) setResults(r ?? []);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, BACKEND_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, enabled]);

  return { results, loading };
}

export function CommandPaletteProvider() {
  useGlobalHotkey();
  const isOpen = usePaletteStore((s) => s.isOpen);
  const close = usePaletteStore((s) => s.close);
  const query = usePaletteStore((s) => s.query);
  const setQuery = usePaletteStore((s) => s.setQuery);

  return (
    <Modal
      className="command-palette"
      isOpen={isOpen}
      onClose={close}
      variant="medium"
      aria-label="Command palette"
      position="top"
      positionOffset="10vh"
    >
      {isOpen && (
        <PaletteBody query={query} setQuery={setQuery} close={close} />
      )}
    </Modal>
  );
}

interface BodyProps {
  query: string;
  setQuery: (v: string) => void;
  close: () => void;
}

function PaletteBody({ query, setQuery, close }: BodyProps) {
  const navigate = useNavigate();
  const staticActions = usePaletteActions({ close });
  const { results, loading } = useBackendResources(query, true);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const resourceActions: PaletteAction[] = useMemo(
    () =>
      results.slice(0, MAX_RESOURCES).map((r, i) => ({
        id: `res:${r.Type}:${r.ID}:${i}`,
        label: r.Name,
        description: `${RESOURCE_LABEL[r.Type] ?? r.Type} - ${r.Matched}`,
        group: "Resources",
        onSelect: () => {
          const path = RESOURCE_ROUTE[r.Type];
          if (path) void navigate(path);
          close();
        },
      })),
    [results, navigate, close],
  );

  const filteredStatic = useMemo(
    () => filterAndRank(staticActions, query).slice(0, MAX_STATIC),
    [staticActions, query],
  );

  const grouped = useMemo(() => {
    const combined = [...filteredStatic, ...resourceActions];
    const map = new Map<PaletteGroup, PaletteAction[]>();
    for (const a of combined) {
      const arr = map.get(a.group) ?? [];
      arr.push(a);
      map.set(a.group, arr);
    }
    return GROUP_ORDER.map((g) => ({
      group: g,
      items: map.get(g) ?? [],
    })).filter((s) => s.items.length > 0);
  }, [filteredStatic, resourceActions]);

  const flat = useMemo(() => grouped.flatMap((s) => s.items), [grouped]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results.length]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      flat[activeIndex]?.onSelect();
    }
  };

  return (
    <>
      <ModalHeader>
        <SearchInput
          ref={inputRef}
          value={query}
          onChange={(_, v) => setQuery(v)}
          onClear={() => setQuery("")}
          placeholder="Search pages, commands, resources..."
          aria-label="Command palette search"
        />
      </ModalHeader>
      <ModalBody onKeyDown={onKey}>
        {flat.length === 0 ? (
          <div className="command-palette__empty">
            {loading ? "Searching..." : query.trim() ? "No results" : "Type to search"}
          </div>
        ) : (
          <Menu isPlain>
            <MenuContent>
              {grouped.map((section, sIdx) => (
                <Fragment key={section.group}>
                  {sIdx > 0 && <Divider />}
                  <MenuGroup label={section.group}>
                    <MenuList>
                      {section.items.map((item) => {
                        const idx = flat.indexOf(item);
                        const active = idx === activeIndex;
                        return (
                          <MenuItem
                            key={item.id}
                            itemId={item.id}
                            isFocused={active}
                            description={item.description}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={item.onSelect}
                          >
                            {item.label}
                          </MenuItem>
                        );
                      })}
                    </MenuList>
                  </MenuGroup>
                </Fragment>
              ))}
            </MenuContent>
          </Menu>
        )}
      </ModalBody>
      <ModalFooter className="command-palette__footer">
        <span>
          <span className="command-palette__kbd">Up</span>
          <span className="command-palette__kbd">Dn</span> navigate
        </span>
        <span>
          <span className="command-palette__kbd">Enter</span> select
        </span>
        <span>
          <span className="command-palette__kbd">Esc</span> close
        </span>
      </ModalFooter>
    </>
  );
}
