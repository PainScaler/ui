import type { ReactNode } from "react";

export type PaletteGroup = "Pages" | "Commands" | "Resources";

export interface PaletteAction {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  group: PaletteGroup;
  icon?: ReactNode;
  shortcut?: string;
  onSelect: () => void;
}
