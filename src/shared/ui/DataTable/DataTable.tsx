import { useState, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnOrderState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PageSection, Pagination, Skeleton } from "@patternfly/react-core";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ActionsColumn,
} from "@patternfly/react-table";
import type { ColumnData, DataTableProps } from "./types";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableEmptyState } from "./DataTableEmptyState";
import CategoryModal from "./CategoryModal";
import { RowDetailModal } from "./RowDetailModal";
import { buildCsv, csvFilename, downloadCsv } from "./exportCsv";
import { formatCell } from "./formatCell";
import { useColumnStore } from "@/shared/stores/columnStore";

const VIRTUALIZE_THRESHOLD = 200;
const VIRTUAL_ROW_HEIGHT = 40;
const VIRTUAL_CONTAINER_HEIGHT = 600;

export function DataTable({
  columns,
  rows,
  isLoading,
  tableKey,
  actions,
  singleAction,
  rowDetailModal = RowDetailModal,
  virtualize,
}: DataTableProps) {
  const storedVisibility = useColumnStore((s) =>
    tableKey ? s.visibility[tableKey] : undefined,
  );
  const storedOrder = useColumnStore((s) =>
    tableKey ? s.order[tableKey] : undefined,
  );
  const storedSorting = useColumnStore((s) =>
    tableKey ? s.sorting[tableKey] : undefined,
  );
  const persistVisibility = useColumnStore((s) => s.setColumnVisibility);
  const persistOrder = useColumnStore((s) => s.setColumnOrder);
  const persistSorting = useColumnStore((s) => s.setColumnSorting);

  const defaultColumnOrder = useMemo(
    () => columns.map((c) => c.key),
    [columns],
  );

  const initialOrder: ColumnOrderState = storedOrder ?? defaultColumnOrder;

  const initialVisibility = useMemo<VisibilityState>(() => {
    if (storedVisibility) return storedVisibility;
    return Object.fromEntries(
      columns.map((col) => [col.key, col.defaultVisible !== false]),
    );
  }, [columns, storedVisibility]);

  const initialColumnData = useMemo<ColumnData[]>(() => {
    const visMap = initialVisibility;
    const ordered = initialOrder
      .map((key) => columns.find((c) => c.key === key))
      .filter((c): c is NonNullable<typeof c> => c !== undefined);
    return ordered.map((col) => ({ ...col, checked: visMap[col.key] !== false }));
  }, [columns, initialOrder, initialVisibility]);

  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [sorting, setSorting] = useState<SortingState>(storedSorting ?? []);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialOrder);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columnData, setColumnData] = useState<ColumnData[]>(initialColumnData);
  const [initialColData, setInitialColData] = useState<ColumnData[]>(initialColumnData);

  const tanstackColumns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      columns.map((col) => ({
        id: col.key,
        accessorKey: col.key,
        header: col.label,
        ...(col.sortingFn
          ? { sortingFn: col.sortingFn as ColumnDef<Record<string, unknown>>["sortingFn"] }
          : {}),
        cell: (info) =>
          col.render ? col.render(info.getValue()) : formatCell(info.getValue()),
      })),
    [columns],
  );

  const handleSortingChange = (updater: SortingState | ((prev: SortingState) => SortingState)) => {
    setSorting((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (tableKey) persistSorting(tableKey, next);
      return next;
    });
  };

  const shouldVirtualize = virtualize ?? rows.length > VIRTUALIZE_THRESHOLD;

  const table = useReactTable({
    data: rows,
    columns: tanstackColumns,
    state: { sorting, globalFilter, columnVisibility, columnOrder },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getColumnCanGlobalFilter: () => true,
    ...(shouldVirtualize
      ? {}
      : { getPaginationRowModel: getPaginationRowModel() }),
    initialState: { pagination: { pageSize: 10 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const visibleLeafCols = table.getVisibleLeafColumns();
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const totalUnfiltered = rows.length;

  const tableRows = shouldVirtualize
    ? table.getSortedRowModel().rows
    : table.getRowModel().rows;

  const scrollRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? tableRows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => VIRTUAL_ROW_HEIGHT,
    overscan: 10,
  });

  const activeSortIndex =
    sorting.length > 0
      ? visibleLeafCols.findIndex((c) => c.id === sorting[0].id)
      : -1;
  const sortDir = sorting.length > 0 && sorting[0].desc ? "desc" : "asc";

  const handleSort = (
    _event: React.MouseEvent,
    index: number,
    direction: "asc" | "desc",
  ) => {
    const col = visibleLeafCols[index];
    handleSortingChange([{ id: col.id, desc: direction === "desc" }]);
  };

  const handleModalToggle = () => {
    setIsModalOpen((open) => !open);
    setInitialColData(columnData);
  };

  const filterData = (checked: boolean, key: string) => {
    setColumnData((prev) =>
      prev.map((col) => (col.key === key ? { ...col, checked } : col)),
    );
  };

  const onSave = () => {
    const newVis: VisibilityState = Object.fromEntries(
      columnData.map((col) => [col.key, col.checked]),
    );
    const newOrder: ColumnOrderState = columnData.map((col) => col.key);

    setColumnVisibility(newVis);
    setColumnOrder(newOrder);
    if (tableKey) {
      persistVisibility(tableKey, newVis);
      persistOrder(tableKey, newOrder);
    }
    setIsModalOpen(false);
  };

  const selectAllColumns = () => {
    const allChecked = columnData.map((col) => ({ ...col, checked: true }));
    setColumnData(allChecked);
    const allVis: VisibilityState = Object.fromEntries(
      columns.map((col) => [col.key, true]),
    );
    setColumnVisibility(allVis);
    if (tableKey) persistVisibility(tableKey, allVis);
  };

  const handleClearFilters = () => {
    setGlobalFilter("");
    selectAllColumns();
  };

  const renderRow = (row: (typeof tableRows)[number]) => (
    <Tr key={row.id}>
      {row.getVisibleCells().map((cell) => (
        <Td key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </Td>
      ))}
      <Td isActionCell>
        <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
          {singleAction
            ? singleAction(row.original, () => setSelectedRow(row.original))
            : null}
          {actions ? <ActionsColumn items={actions(row.original)} /> : null}
        </div>
      </Td>
    </Tr>
  );

  const tableBody = (
    <Tbody>
      {isLoading ? (
        Array.from({ length: pageSize }).map((_, rowIndex) => (
          // eslint-disable-next-line react-x/no-array-index-key -- skeleton placeholders have no identity
          <Tr key={`sk-row-${rowIndex}`}>
            {visibleLeafCols.map((col) => (
              <Td key={`sk-${col.id}`}>
                <Skeleton />
              </Td>
            ))}
          </Tr>
        ))
      ) : tableRows.length === 0 ? (
        <DataTableEmptyState
          colSpan={visibleLeafCols.length}
          onClearFilters={handleClearFilters}
        />
      ) : shouldVirtualize ? (
        <>
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <Tr
              style={{
                height: `${rowVirtualizer.getVirtualItems()[0].start}px`,
              }}
            >
              <Td colSpan={visibleLeafCols.length + 2} style={{ padding: 0, border: 0 }} />
            </Tr>
          )}
          {rowVirtualizer.getVirtualItems().map((vi) => renderRow(tableRows[vi.index]))}
          {rowVirtualizer.getVirtualItems().length > 0 && (
            <Tr
              style={{
                height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)}px`,
              }}
            >
              <Td colSpan={visibleLeafCols.length + 2} style={{ padding: 0, border: 0 }} />
            </Tr>
          )}
        </>
      ) : (
        tableRows.map((row) => renderRow(row))
      )}
    </Tbody>
  );

  const tableMarkup = (
    <Table variant="compact" aria-label="Column Management Table">
      <Thead>
        <Tr>
          {visibleLeafCols.map((col, columnIndex) => (
            <Th
              key={col.id}
              sort={{
                sortBy: { index: activeSortIndex, direction: sortDir },
                onSort: handleSort,
                columnIndex,
              }}
            >
              {String(col.columnDef.header ?? col.id)}
            </Th>
          ))}
        </Tr>
      </Thead>
      {tableBody}
    </Table>
  );

  return (
    <PageSection isFilled aria-label="Draggable Column Management table data">
      <DataTableToolbar
        totalRows={totalFiltered}
        totalUnfiltered={totalUnfiltered}
        page={pageIndex + 1}
        perPage={pageSize}
        onSetPage={(_evt, newPage) => table.setPageIndex(newPage - 1)}
        onPerPageSelect={(_evt, newPerPage) => table.setPageSize(newPerPage)}
        onManageColumns={handleModalToggle}
        filterText={globalFilter}
        onFilterChange={setGlobalFilter}
        onExportCsv={() => {
          const filteredRows = table
            .getFilteredRowModel()
            .rows.map((r) => r.original);
          const csv = buildCsv(columns, filteredRows);
          downloadCsv(csvFilename(tableKey), csv);
        }}
      />
      {shouldVirtualize ? (
        <div
          ref={scrollRef}
          style={{ overflow: "auto", maxHeight: VIRTUAL_CONTAINER_HEIGHT }}
        >
          {tableMarkup}
        </div>
      ) : (
        tableMarkup
      )}
      {!shouldVirtualize && tableRows.length > 0 && (
        <Pagination
          itemCount={totalFiltered}
          page={pageIndex + 1}
          perPage={pageSize}
          onSetPage={(_evt, newPage) => table.setPageIndex(newPage - 1)}
          onPerPageSelect={(_evt, newPerPage) => table.setPageSize(newPerPage)}
          variant="bottom"
          titles={{ paginationAriaLabel: "bottom pagination" }}
        />
      )}
      {rowDetailModal({
        isOpen: selectedRow !== null,
        onClose: () => setSelectedRow(null),
        row: selectedRow,
        columns,
      })}
      <CategoryModal
        isModalOpen={isModalOpen}
        columnData={columnData}
        handleModalToggle={handleModalToggle}
        initialColData={initialColData}
        selectAllColumns={selectAllColumns}
        setColumnData={setColumnData}
        filterData={filterData}
        onSave={onSave}
      />
    </PageSection>
  );
}
