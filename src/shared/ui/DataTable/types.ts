import type { IAction } from "@patternfly/react-table";
import type { JSX, ReactNode } from "react";

export interface RowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: Record<string, unknown> | null;
  columns: Column[];
}

export interface Column {
  label: string;
  key: string;
  /** Whether this column is visible by default. Defaults to true. */
  defaultVisible?: boolean;
  /** Custom cell renderer. Falls back to String(value) when omitted. */
  render?: (value: unknown) => ReactNode;
  /** Plain-text renderer used for exports (CSV). Falls back to String(value). */
  toText?: (value: unknown) => string;
  /** TanStack built-in sorting function name. Defaults to "auto". */
  sortingFn?: string;
}

export type ColumnData = Column & {
  checked: boolean;
};

export interface DataTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  isLoading?: boolean;
  tableKey?: string;
  actions?: (row: Record<string, unknown>) => IAction[];
  singleAction?: (
    row: Record<string, unknown>,
    onClick: () => void,
  ) => ReactNode;
  rowDetailModal?: ({
    isOpen,
    onClose,
    row,
    columns,
  }: RowDetailModalProps) => JSX.Element;
  /** Enable row virtualization. Auto-enabled when rows.length > 200. Disables pagination. */
  virtualize?: boolean;
}

export interface DataWrapperProps<T> {
  data: T[];
  columns: Column[];
  isLoading?: boolean;
  tableKey?: string;
  toRow?: (item: T) => Record<string, unknown>;
  actions?: (row: Record<string, unknown>) => IAction[];
  singleAction?: (
    row: Record<string, unknown>,
    onClick: () => void,
  ) => ReactNode;
  rowDetailModal?: ({
    isOpen,
    onClose,
    row,
    columns,
  }: RowDetailModalProps) => JSX.Element;
}
