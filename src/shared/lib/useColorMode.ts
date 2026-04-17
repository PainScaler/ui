import { useEffect } from "react";
import { useUIStore } from "@/shared/stores/uiStore";

export type ColorMode = "light" | "dark" | "system";

const PF_DARK_CLASS = "pf-v6-theme-dark";

function applyMode(mode: ColorMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);

  if (isDark) {
    root.classList.add(PF_DARK_CLASS);
  } else {
    root.classList.remove(PF_DARK_CLASS);
  }

  if (mode === "system") {
    root.removeAttribute("data-color-mode");
  } else {
    root.setAttribute("data-color-mode", mode);
  }
}

export function useColorMode() {
  const mode = useUIStore((s) => s.colorMode);
  const setColorMode = useUIStore((s) => s.setColorMode);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  // Re-apply when system preference changes (only relevant in "system" mode)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (useUIStore.getState().colorMode === "system") {
        applyMode("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return { mode, setMode: setColorMode };
}
