import { DataTable } from "./DataTable";
import type { DataWrapperProps } from "./types";

export function DataWrapper<T>({
  data,
  columns,
  isLoading,
  tableKey,
  toRow,
  rowDetailModal,
  singleAction,
  actions,
}: DataWrapperProps<T>) {
  let rows: Record<string, unknown>[] = [];
  if (data)
    rows = data.map(toRow ?? ((item) => item as Record<string, unknown>));

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      tableKey={tableKey}
      rowDetailModal={rowDetailModal}
      singleAction={singleAction}
      actions={actions}
    />
  );
}
