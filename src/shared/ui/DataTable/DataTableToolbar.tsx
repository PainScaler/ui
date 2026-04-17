import {
  Button,
  OverflowMenu,
  OverflowMenuGroup,
  OverflowMenuItem,
  Pagination,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";

interface DataTableToolbarProps {
  totalRows: number;
  totalUnfiltered?: number;
  page: number;
  perPage: number;
  filterText: string;
  onFilterChange: (value: string) => void;
  onSetPage: (
    evt:
      | MouseEvent
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    newPage: number,
  ) => void;
  onPerPageSelect: (
    evt:
      | MouseEvent
      | React.MouseEvent<Element, MouseEvent>
      | React.KeyboardEvent<Element>,
    newPerPage: number,
  ) => void;
  onManageColumns: () => void;
  onExportCsv?: () => void;
}

export function DataTableToolbar({
  totalRows,
  totalUnfiltered,
  page,
  perPage,
  filterText,
  onFilterChange,
  onSetPage,
  onPerPageSelect,
  onManageColumns,
  onExportCsv,
}: DataTableToolbarProps) {
  const isFiltered =
    totalUnfiltered !== undefined && totalRows !== totalUnfiltered;

  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem>
          <OverflowMenu breakpoint="md">
            <OverflowMenuItem>
              <SearchInput
                placeholder="Filter"
                value={filterText}
                onChange={(_evt, value) => onFilterChange(value)}
                onClear={() => onFilterChange("")}
              />
            </OverflowMenuItem>
            <OverflowMenuGroup groupType="button" isPersistent>
              <OverflowMenuItem isPersistent>
                <Button variant="link" onClick={onManageColumns}>
                  Manage columns
                </Button>
              </OverflowMenuItem>
              {onExportCsv && (
                <OverflowMenuItem>
                  <Button
                    variant="link"
                    onClick={onExportCsv}
                    isDisabled={totalRows === 0}
                  >
                    Export CSV
                  </Button>
                </OverflowMenuItem>
              )}
            </OverflowMenuGroup>
          </OverflowMenu>
        </ToolbarItem>
        {isFiltered && (
          <ToolbarItem>
            <span
              style={{
                fontSize: "0.85em",
                color: "var(--pf-t--global--color--nonstatus--gray--default)",
              }}
            >
              {totalRows} of {totalUnfiltered}
            </span>
          </ToolbarItem>
        )}
        <ToolbarItem variant="pagination">
          <Pagination
            isCompact={false}
            itemCount={totalRows}
            page={page}
            perPage={perPage}
            onSetPage={onSetPage}
            onPerPageSelect={onPerPageSelect}
            variant="top"
            titles={{ paginationAriaLabel: "top pagination" }}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
}
