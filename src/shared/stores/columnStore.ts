import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SortingState } from "@tanstack/react-table";

interface ColumnStore {
  visibility: Record<string, Record<string, boolean>>;
  order: Record<string, string[]>;
  sorting: Record<string, SortingState>;
  setColumnVisibility: (tableKey: string, visibility: Record<string, boolean>) => void;
  setColumnOrder: (tableKey: string, order: string[]) => void;
  setColumnSorting: (tableKey: string, sorting: SortingState) => void;
}

export const useColumnStore = create<ColumnStore>()(
  persist(
    (set) => ({
      visibility: {},
      order: {},
      sorting: {},
      setColumnVisibility: (tableKey, vis) =>
        set((s) => ({ visibility: { ...s.visibility, [tableKey]: vis } })),
      setColumnOrder: (tableKey, ord) =>
        set((s) => ({ order: { ...s.order, [tableKey]: ord } })),
      setColumnSorting: (tableKey, srt) =>
        set((s) => ({ sorting: { ...s.sorting, [tableKey]: srt } })),
    }),
    { name: "painscaler-columns" },
  ),
);
