import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ColorMode } from "@/shared/lib/useColorMode";

interface UIStore {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      colorMode: "system",
      setColorMode: (mode) => set({ colorMode: mode }),
    }),
    { name: "painscaler-ui" },
  ),
);
