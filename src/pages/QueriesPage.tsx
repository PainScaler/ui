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
  PageSection,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText,
  TextInput,
} from "@patternfly/react-core";
import { Table, Thead, Tbody, Tr, Th, Td } from "@patternfly/react-table";
import { Search, PoliciesForSegment, WhoCanReach } from "@/shared/api/api.gen";
import { index } from "@/shared/api/models.gen";
import { SearchSelect } from "@/shared/ui/SearchSelect";
import type { NamedOption } from "@/features/simulator/components/types";
import { resetScroll } from "@/shared/lib/scroll";
import { useSegments } from "@/shared/api/queries";

// --- Search tab ---

function SearchTab() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<index.SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!term.trim()) return;
    setLoading(true);
    setError(null);
    Search(term.trim())
      .then((r) => setResults(r ?? []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") run();
  };

  return (
    <Stack hasGutter style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <StackItem>
        <div style={{ display: "flex", gap: "var(--pf-t--global--spacer--sm)", alignItems: "center" }}>
          <TextInput
            value={term}
            onChange={(_, v) => setTerm(v)}
            onKeyDown={handleKey}
            placeholder="Search segments, groups, policies, server groups..."
            aria-label="Search term"
            style={{ flex: 1 }}
          />
          <Button onClick={run} isLoading={loading} isDisabled={!term.trim() || loading}>
            Search
          </Button>
        </div>
      </StackItem>
      {error && <StackItem><Alert variant="danger" isInline title={error} /></StackItem>}
      {results !== null && (
        <StackItem>
          {results.length === 0 ? (
            <EmptyState>
              <EmptyStateBody>No results for &ldquo;{term}&rdquo;</EmptyStateBody>
            </EmptyState>
          ) : (
            <Table aria-label="Search results" variant="compact">
              <Thead>
                <Tr>
                  <Th>Type</Th>
                  <Th>Name</Th>
                  <Th>Matched</Th>
                </Tr>
              </Thead>
              <Tbody>
                {results.map((r) => (
                  <Tr key={r.Name}>
                    <Td>{r.Type}</Td>
                    <Td>{r.Name}</Td>
                    <Td><code>{r.Matched}</code></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </StackItem>
      )}
    </Stack>
  );
}

// --- Policies for Segment tab ---

function PoliciesForSegmentTab() {
  const { data: segments = [] } = useSegments()
  const segmentOptions = useMemo<NamedOption[]>(
    () =>
      (segments ?? [])
        .map((s) => ({ id: s.id ?? "", label: s.name ?? s.id ?? "" }))
        .filter((o) => o.id),
    [segments],
  );
  const [segmentID, setSegmentID] = useState("");
  const [results, setResults] = useState<index.PolicyCoverage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!segmentID) return;
    setLoading(true);
    setError(null);
    PoliciesForSegment(segmentID)
      .then((r) => setResults(r ?? []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  return (
    <Stack hasGutter style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <StackItem>
        <div style={{ display: "flex", gap: "var(--pf-t--global--spacer--sm)", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <SearchSelect
              value={segmentID}
              options={segmentOptions}
              onChange={(id) => { setSegmentID(id); setResults(null); }}
              placeholder="Select a segment..."
            />
          </div>
          <Button onClick={run} isLoading={loading} isDisabled={!segmentID || loading}>
            Query
          </Button>
        </div>
      </StackItem>
      {error && <StackItem><Alert variant="danger" isInline title={error} /></StackItem>}
      {results !== null && (
        <StackItem>
          {results.length === 0 ? (
            <EmptyState>
              <EmptyStateBody>No policies cover this segment.</EmptyStateBody>
            </EmptyState>
          ) : (
            <Table aria-label="Policies for segment" variant="compact">
              <Thead>
                <Tr>
                  <Th>Policy Name</Th>
                  <Th>Action</Th>
                  <Th>Via</Th>
                </Tr>
              </Thead>
              <Tbody>
                {results.map((c) => (
                  <Tr key={c.Policy?.id}>
                    <Td>{c.Policy?.name ?? "-"}</Td>
                    <Td>{c.Policy?.action ?? "-"}</Td>
                    <Td>{c.Via}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </StackItem>
      )}
    </Stack>
  );
}

// --- Who Can Reach tab ---

function WhoCanReachTab() {
  const [hostname, setHostname] = useState("");
  const [result, setResult] = useState<index.ReachabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!hostname.trim()) return;
    setLoading(true);
    setError(null);
    WhoCanReach(hostname.trim())
      .then((r) => setResult(r))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") run();
  };

  return (
    <Stack hasGutter style={{ paddingTop: "var(--pf-t--global--spacer--md)" }}>
      <StackItem>
        <div style={{ display: "flex", gap: "var(--pf-t--global--spacer--sm)", alignItems: "center" }}>
          <TextInput
            value={hostname}
            onChange={(_, v) => setHostname(v)}
            onKeyDown={handleKey}
            placeholder="hostname or domain (e.g. app.corp.example.com)"
            aria-label="Hostname"
            style={{ flex: 1 }}
          />
          <Button onClick={run} isLoading={loading} isDisabled={!hostname.trim() || loading}>
            Query
          </Button>
        </div>
      </StackItem>
      {error && <StackItem><Alert variant="danger" isInline title={error} /></StackItem>}
      {result !== null && (
        <StackItem>
          {result.Segments == null || result.Segments.length === 0 ? (
            <EmptyState>
              <EmptyStateBody>No segments cover &ldquo;{result.Domain}&rdquo;.</EmptyStateBody>
            </EmptyState>
          ) : (
            <Stack hasGutter>
              {result.Segments.map((sr) => (
                <StackItem key={`sitem-${sr.Policies.length}`}>
                  <Card isCompact>
                    <CardTitle>{sr.Segment?.name ?? sr.Segment?.id ?? "Unknown segment"}</CardTitle>
                    <Divider />
                    <CardBody>
                      {sr.Policies == null || sr.Policies.length === 0 ? (
                        <em>No policies cover this segment.</em>
                      ) : (
                        <Table aria-label="Policies" variant="compact">
                          <Thead>
                            <Tr>
                              <Th>Policy Name</Th>
                              <Th>Action</Th>
                              <Th>Via</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {sr.Policies.map((c) => (
                              <Tr key={c.Policy?.name}>
                                <Td>{c.Policy?.name ?? "-"}</Td>
                                <Td>{c.Policy?.action ?? "-"}</Td>
                                <Td>{c.Via}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      )}
                    </CardBody>
                  </Card>
                </StackItem>
              ))}
            </Stack>
          )}
        </StackItem>
      )}
    </Stack>
  );
}

// --- Page ---

export function QueriesPage() {
  const [activeTab, setActiveTab] = useState<string | number>(0);

  return (
    <PageSection aria-label="Queries">
      <Tabs
        activeKey={activeTab}
        onSelect={(_, k) => { setActiveTab(k); resetScroll(); }}
        role="region"
      >
        <Tab eventKey={0} title={<TabTitleText>Search</TabTitleText>}>
          <SearchTab />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>Policies for Segment</TabTitleText>}>
          <PoliciesForSegmentTab />
        </Tab>
        <Tab eventKey={2} title={<TabTitleText>Who Can Reach</TabTitleText>}>
          <WhoCanReachTab />
        </Tab>
      </Tabs>
    </PageSection>
  );
}
