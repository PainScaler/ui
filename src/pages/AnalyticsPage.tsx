import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Divider,
  EmptyState,
  EmptyStateBody,
  Grid,
  GridItem,
  Label,
  PageSection,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { Table, Thead, Tbody, Tr, Th, Td, ExpandableRowContent } from "@patternfly/react-table";
import {
  GetBlastRadius,
} from "@/shared/api/api.gen";
import { analysis } from "@/shared/api/models.gen";
import { SearchSelect } from "@/shared/ui/SearchSelect";
import type { NamedOption } from "@/features/simulator/components/types";
import { resetScroll } from "@/shared/lib/scroll";
import {
  useAppConnectorGroups,
  useServerGroups,
  usePolicyShadows,
  useOrphanClusters,
  useDomainOverlaps,
  useConnectorLoad,
  useScimReach,
} from "@/shared/api/queries";

// --- 1. Blast Radius ---

function BlastRadiusTab() {
  const { data: connectorGroups = [] } = useAppConnectorGroups();
  const { data: serverGroups = [] } = useServerGroups();

  const cgOptions = useMemo<NamedOption[]>(
    () => connectorGroups.map((g) => ({ id: g.id ?? "", label: g.name ?? g.id ?? "" })).filter((o) => o.id),
    [connectorGroups],
  );
  const sgOptions = useMemo<NamedOption[]>(
    () => serverGroups.map((g) => ({ id: g.id ?? "", label: g.name ?? g.id ?? "" })).filter((o) => o.id),
    [serverGroups],
  );

  const [targetType, setTargetType] = useState<"connector_group" | "server_group">("connector_group");
  const [targetID, setTargetID] = useState("");
  const [result, setResult] = useState<analysis.BlastRadiusReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!targetID) return;
    setLoading(true);
    setError(null);
    GetBlastRadius(targetID, targetType)
      .then((r) => setResult(r))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  return (
    <Stack hasGutter style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <StackItem>
        <Stack hasGutter>
          <StackItem>
            <ToggleGroup aria-label="Target type">
              <ToggleGroupItem
                text="Connector Group"
                isSelected={targetType === "connector_group"}
                onChange={() => { setTargetType("connector_group"); setTargetID(""); setResult(null); }}
              />
              <ToggleGroupItem
                text="Server Group"
                isSelected={targetType === "server_group"}
                onChange={() => { setTargetType("server_group"); setTargetID(""); setResult(null); }}
              />
            </ToggleGroup>
          </StackItem>
          <StackItem>
            <div style={{ display: "flex", gap: "var(--pf-t--global--spacer--sm)", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <SearchSelect
                  value={targetID}
                  options={targetType === "connector_group" ? cgOptions : sgOptions}
                  onChange={(id) => { setTargetID(id); setResult(null); }}
                  placeholder={targetType === "connector_group" ? "Select a connector group..." : "Select a server group..."}
                />
              </div>
              <Button onClick={run} isLoading={loading} isDisabled={!targetID || loading}>
                Analyze
              </Button>
            </div>
          </StackItem>
        </Stack>
      </StackItem>
      {error && <StackItem><Alert variant="danger" isInline title={error} /></StackItem>}
      {result !== null && (
        <StackItem>
          {(result.policies?.length ?? 0) === 0 &&
           (result.scimGroups?.length ?? 0) === 0 &&
           (result.segments?.length ?? 0) === 0 ? (
            <EmptyState>
              <EmptyStateBody>No impact found for this target.</EmptyStateBody>
            </EmptyState>
          ) : (
            <Stack hasGutter>
              <StackItem>
                <Card isCompact>
                  <CardTitle>Affected Policies ({result.policies?.length ?? 0})</CardTitle>
                  <Divider />
                  <CardBody>
                    <RefTable items={result.policies} />
                  </CardBody>
                </Card>
              </StackItem>
              <StackItem>
                <Card isCompact>
                  <CardTitle>Affected SCIM Groups ({result.scimGroups?.length ?? 0})</CardTitle>
                  <Divider />
                  <CardBody>
                    <RefTable items={result.scimGroups} />
                  </CardBody>
                </Card>
              </StackItem>
              <StackItem>
                <Card isCompact>
                  <CardTitle>Affected Segments ({result.segments?.length ?? 0})</CardTitle>
                  <Divider />
                  <CardBody>
                    <RefTable items={result.segments} />
                  </CardBody>
                </Card>
              </StackItem>
            </Stack>
          )}
        </StackItem>
      )}
    </Stack>
  );
}

function RefTable({ items }: { items?: analysis.NamedRef[] }) {
  if (!items || items.length === 0) return <em>None</em>;
  return (
    <Table aria-label="Items" variant="compact">
      <Thead><Tr><Th>Name</Th><Th>ID</Th></Tr></Thead>
      <Tbody>
        {items.map((r) => (
          <Tr key={r.id}><Td>{r.name}</Td><Td><code>{r.id}</code></Td></Tr>
        ))}
      </Tbody>
    </Table>
  );
}

// --- 2. Policy Shadows ---

function PolicyShadowsTab() {
  const { data: shadows, error, isLoading } = usePolicyShadows();

  if (isLoading) return <em>Loading...</em>;
  if (error) return <Alert variant="danger" isInline title={String(error)} />;
  if (!shadows || shadows.length === 0) {
    return (
      <EmptyState>
        <EmptyStateBody>No policy overlaps detected.</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <Table aria-label="Policy shadows" variant="compact">
        <Thead>
          <Tr>
            <Th>Policy A</Th>
            <Th>Policy B</Th>
            <Th>Shared SCIM Groups</Th>
            <Th>Shared Segments</Th>
            <Th>Verdict</Th>
          </Tr>
        </Thead>
        <Tbody>
          {shadows.map((s, i) => (
            <Tr key={i}>
              <Td>{s.policyA?.name ?? "-"} <small>(#{s.policyA?.ruleOrder})</small></Td>
              <Td>{s.policyB?.name ?? "-"} <small>(#{s.policyB?.ruleOrder})</small></Td>
              <Td>{s.sharedScimGroups?.length ?? 0}</Td>
              <Td>{s.sharedSegments?.length ?? 0}</Td>
              <Td>
                <Label color={s.verdict === "conflict" ? "red" : "yellow"}>
                  {s.verdict}
                </Label>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}

// --- 3. Orphan Clusters ---

function OrphanClustersTab() {
  const { data: clusters, error, isLoading } = useOrphanClusters();

  if (isLoading) return <em>Loading...</em>;
  if (error) return <Alert variant="danger" isInline title={String(error)} />;
  if (!clusters || clusters.length === 0) {
    return (
      <EmptyState>
        <EmptyStateBody>No orphan clusters found.</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <Grid hasGutter>
        {clusters.map((c) => (
          <GridItem key={c.segmentGroupId} span={6}>
            <Card isFullHeight>
              <CardTitle>
                {c.segmentGroupName}{" "}
                <Label color={c.fullyOrphaned ? "red" : "yellow"}>
                  {c.fullyOrphaned ? "fully orphaned" : "partially orphaned"}
                </Label>
              </CardTitle>
              <Divider />
              <CardBody>
                <Stack hasGutter>
                  <StackItem>
                    <strong>Orphan segments ({c.orphanSegments?.length ?? 0})</strong>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {c.orphanSegments?.map((s) => <li key={s.id}>{s.name}</li>)}
                    </ul>
                  </StackItem>
                  {(c.connectorGroups?.length ?? 0) > 0 && (
                    <StackItem>
                      <strong>Connector groups</strong>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {c.connectorGroups?.map((cg) => <li key={cg.id}>{cg.name || cg.id}</li>)}
                      </ul>
                    </StackItem>
                  )}
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </div>
  );
}

// --- 4. Domain Overlaps ---

function DomainOverlapsTab() {
  const { data: overlaps, error, isLoading } = useDomainOverlaps();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  if (isLoading) return <em>Loading...</em>;
  if (error) return <Alert variant="danger" isInline title={String(error)} />;
  if (!overlaps || overlaps.length === 0) {
    return (
      <EmptyState>
        <EmptyStateBody>No domain overlaps found.</EmptyStateBody>
      </EmptyState>
    );
  }

  const toggle = (idx: number) => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <Table aria-label="Domain overlaps" variant="compact">
        <Thead>
          <Tr>
            <Th />
            <Th>Domain</Th>
            <Th>Segments</Th>
            <Th>Conflict</Th>
          </Tr>
        </Thead>
        <Tbody>
          {overlaps.flatMap((o, idx) => {
            const parent = (
              <Tr key={`p-${idx}`}>
                <Td
                  expand={{ rowIndex: idx, isExpanded: !!expanded[idx], onToggle: () => toggle(idx) }}
                />
                <Td><code>{o.domain}</code></Td>
                <Td>{o.segments?.length ?? 0}</Td>
                <Td>{o.hasConflict ? <Label color="red">conflict</Label> : "-"}</Td>
              </Tr>
            );
            const child = expanded[idx] ? (
              <Tr key={`c-${idx}`} isExpanded>
                <Td />
                <Td colSpan={3}>
                  <ExpandableRowContent>
                    <Table aria-label="Segments" variant="compact">
                      <Thead><Tr><Th>Segment</Th><Th>Policies</Th></Tr></Thead>
                      <Tbody>
                        {o.segments?.map((seg) => (
                          <Tr key={seg.id}>
                            <Td>{seg.name}</Td>
                            <Td>{seg.policies?.map((p) => p.name).join(", ") || "-"}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </ExpandableRowContent>
                </Td>
              </Tr>
            ) : null;
            return child ? [parent, child] : [parent];
          })}
        </Tbody>
      </Table>
    </div>
  );
}

// --- 5. Connector Load ---

function ConnectorLoadTab() {
  const { data: entries, error, isLoading } = useConnectorLoad();

  if (isLoading) return <em>Loading...</em>;
  if (error) return <Alert variant="danger" isInline title={String(error)} />;
  if (!entries || entries.length === 0) {
    return (
      <EmptyState>
        <EmptyStateBody>No connector groups found.</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <Table aria-label="Connector load" variant="compact">
        <Thead>
          <Tr>
            <Th>Connector Group</Th>
            <Th>Policies</Th>
            <Th>Segment Groups</Th>
            <Th>Segments</Th>
            <Th>SCIM Groups</Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map((e) => (
            <Tr key={e.connectorGroupId}>
              <Td>{e.connectorGroupName || e.connectorGroupId}</Td>
              <Td>{e.policyCount}</Td>
              <Td>{e.segmentGroupCount}</Td>
              <Td>{e.segmentCount}</Td>
              <Td>{e.scimGroupCount}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}

// --- 6. SCIM Reach ---

function ScimReachTab() {
  const { data: entries, error, isLoading } = useScimReach();

  if (isLoading) return <em>Loading...</em>;
  if (error) return <Alert variant="danger" isInline title={String(error)} />;
  if (!entries || entries.length === 0) {
    return (
      <EmptyState>
        <EmptyStateBody>No SCIM groups found.</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <div style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <Table aria-label="SCIM reach" variant="compact">
        <Thead>
          <Tr>
            <Th>SCIM Group</Th>
            <Th>Policies</Th>
            <Th>Segment Groups</Th>
            <Th>Segments</Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map((e) => (
            <Tr key={e.scimGroupId}>
              <Td>{e.scimGroupName || e.scimGroupId}</Td>
              <Td>{e.policyCount}</Td>
              <Td>{e.segmentGroupCount}</Td>
              <Td>{e.segmentCount}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}

// --- Page ---

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string | number>(0);

  return (
    <PageSection aria-label="Analytics">
      <Tabs
        activeKey={activeTab}
        onSelect={(_, k) => { setActiveTab(k); resetScroll(); }}
        role="region"
      >
        <Tab eventKey={0} title={<TabTitleText>Blast Radius</TabTitleText>}>
          <BlastRadiusTab />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Policy Shadows</TabTitleText>}>
          <PolicyShadowsTab />
        </Tab>
        <Tab eventKey={2} title={<TabTitleText>Orphan Clusters</TabTitleText>}>
          <OrphanClustersTab />
        </Tab>
        <Tab eventKey={3} title={<TabTitleText>Domain Overlaps</TabTitleText>}>
          <DomainOverlapsTab />
        </Tab>
        <Tab eventKey={4} title={<TabTitleText>Connector Load</TabTitleText>}>
          <ConnectorLoadTab />
        </Tab>
        <Tab eventKey={5} title={<TabTitleText>SCIM Reach</TabTitleText>}>
          <ScimReachTab />
        </Tab>
      </Tabs>
    </PageSection>
  );
}
