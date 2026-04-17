import { useMemo, useState } from "react";
import {
  Alert,
  PageSection,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Content,
  ContentVariants,
} from "@patternfly/react-core";
import { Table, Thead, Tbody, Tr, Th, Td } from "@patternfly/react-table";
import { useRoutes } from "@/shared/api/queries";
import type { analysis } from "@/shared/api/models.gen";

type Route = analysis.Route;

const COLUMNS = [
  { key: "scimGroup" as const, label: "SCIM Group" },
  { key: "policy" as const, label: "Policy" },
  { key: "connectorGroup" as const, label: "Connector Group" },
  { key: "segmentGroup" as const, label: "Segment Group" },
  { key: "segment" as const, label: "Segment" },
];

function matchesFilter(route: Route, filter: string): boolean {
  const lower = filter.toLowerCase();
  return COLUMNS.some((col) => {
    const entry = route[col.key];
    return entry?.name?.toLowerCase().includes(lower) || entry?.id?.toLowerCase().includes(lower);
  });
}

export const RoutesPage: React.FunctionComponent = () => {
  const { data, error, isLoading } = useRoutes();
  const [filter, setFilter] = useState("");
  const [selectedCol, setSelectedCol] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const routes = data?.routes ?? [];

  const filtered = useMemo(() => {
    let result = routes;
    if (filter) {
      result = result.filter((r) => matchesFilter(r, filter));
    }
    if (selectedCol && selectedId) {
      result = result.filter((r) => {
        const entry = r[selectedCol as keyof Route] as analysis.RouteEntry | undefined;
        return entry?.id === selectedId;
      });
    }
    return result;
  }, [routes, filter, selectedCol, selectedId]);

  const handleCellClick = (colKey: string, id: string) => {
    if (selectedCol === colKey && selectedId === id) {
      setSelectedCol(null);
      setSelectedId(null);
    } else {
      setSelectedCol(colKey);
      setSelectedId(id);
    }
  };

  if (isLoading) return <PageSection><em>Loading routes...</em></PageSection>;
  if (error) return <PageSection><Alert variant="danger" isInline title={String(error)} /></PageSection>;

  return (
    <PageSection>
      <Content component={ContentVariants.h1}>Route Matrix</Content>
      <Content component={ContentVariants.p}>
        {routes.length} routes total, {filtered.length} shown
        {selectedId && (
          <>
            {" "}&mdash;{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); setSelectedCol(null); setSelectedId(null); }}>
              clear filter
            </a>
          </>
        )}
      </Content>

      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              placeholder="Filter routes..."
              value={filter}
              onChange={(_e, val) => setFilter(val)}
              onClear={() => setFilter("")}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="Route matrix" variant="compact" isStickyHeader>
        <Thead>
          <Tr>
            <Th>#</Th>
            {COLUMNS.map((col) => (
              <Th key={col.key}>{col.label}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {filtered.slice(0, 500).map((route, i) => (
            <Tr key={i}>
              <Td dataLabel="#">{i + 1}</Td>
              {COLUMNS.map((col) => {
                const entry = route[col.key];
                const isSelected = selectedCol === col.key && selectedId === entry?.id;
                return (
                  <Td
                    key={col.key}
                    dataLabel={col.label}
                    style={{
                      cursor: entry?.id ? "pointer" : "default",
                      background: isSelected ? "var(--pf-t--global--color--brand--default)" : undefined,
                      color: isSelected ? "#fff" : undefined,
                      fontWeight: isSelected ? 600 : undefined,
                    }}
                    onClick={() => entry?.id && handleCellClick(col.key, entry.id)}
                  >
                    {entry?.name || entry?.id || "-"}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
      {filtered.length > 500 && (
        <Content component={ContentVariants.small}>
          Showing first 500 of {filtered.length} routes. Use filter to narrow down.
        </Content>
      )}
    </PageSection>
  );
};
