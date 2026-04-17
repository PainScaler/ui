import { useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  SearchInput,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import type { FlowColumn, FlowFilters } from "./buildGraph";
import { COLUMN_LABELS, EMPTY_FILTERS } from "./buildGraph";
import type { NamedOption } from "@/features/simulator/components/types";

interface FilterOption extends NamedOption {
  selected: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FlowFilters;
  onApply: (f: FlowFilters, cols: Set<FlowColumn>) => void;
  visibleCols: Set<FlowColumn>;
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  searchMatchCount: number;
  scimGroups: NamedOption[];
  policies: NamedOption[];
  connectorGroups: NamedOption[];
  segmentGroups: NamedOption[];
}

function FilterSection({
  label,
  options,
  onToggle,
}: {
  label: string;
  options: FilterOption[];
  onToggle: (id: string) => void;
}) {
  const [filter, setFilter] = useState("");
  const filtered = filter
    ? options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()))
    : options;

  return (
    <FormGroup label={label} fieldId={label}>
      <SearchInput
        value={filter}
        onChange={(_, v) => setFilter(v)}
        onClear={() => setFilter("")}
        placeholder={`Filter ${label.toLowerCase()}...`}
      />
      <div style={{ maxHeight: 160, overflow: "auto", marginTop: 4 }}>
        {filtered.map((o) => (
          <Checkbox
            key={o.id}
            id={`filter-${label}-${o.id}`}
            label={o.label}
            isChecked={o.selected}
            onChange={() => onToggle(o.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 8, opacity: 0.5, fontSize: 13 }}>No matches</div>
        )}
      </div>
    </FormGroup>
  );
}

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  visibleCols,
  searchTerm,
  onSearchTermChange,
  searchMatchCount,
  scimGroups,
  policies,
  connectorGroups,
  segmentGroups,
}: Props) {
  const [draft, setDraft] = useState(filters);
  const [draftCols, setDraftCols] = useState(visibleCols);

  // Reset draft when opening
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen && !prevOpen) {
    setDraft(filters);
    setDraftCols(visibleCols);
  }
  if (isOpen !== prevOpen) setPrevOpen(isOpen);

  const toggleSet = (current: Set<string>, id: string): Set<string> => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  const toFilterOptions = (opts: NamedOption[], selected: Set<string>): FilterOption[] =>
    opts.map((o) => ({ ...o, selected: selected.has(o.id) }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="flow-filter-title"
      variant="medium"
    >
      <ModalHeader title="Graph Filters" labelId="flow-filter-title" />
      <ModalBody>
        <Form>
          <Stack hasGutter>
            <StackItem>
              <FormGroup
                label={
                  searchTerm.trim()
                    ? `Search nodes (${searchMatchCount} match${searchMatchCount === 1 ? "" : "es"})`
                    : "Search nodes"
                }
                fieldId="flow-node-search"
              >
                <SearchInput
                  id="flow-node-search"
                  value={searchTerm}
                  onChange={(_, v) => onSearchTermChange(v)}
                  onClear={() => onSearchTermChange("")}
                  placeholder="Search node labels..."
                />
              </FormGroup>
            </StackItem>
            <StackItem>
              <FilterSection
                label="SCIM Groups"
                options={toFilterOptions(scimGroups, draft.scimGroupIds)}
                onToggle={(id) => setDraft((d) => ({ ...d, scimGroupIds: toggleSet(d.scimGroupIds, id) }))}
              />
            </StackItem>
            <StackItem>
              <FilterSection
                label="Policies"
                options={toFilterOptions(policies, draft.policyIds)}
                onToggle={(id) => setDraft((d) => ({ ...d, policyIds: toggleSet(d.policyIds, id) }))}
              />
            </StackItem>
            <StackItem>
              <FilterSection
                label="Connector Groups"
                options={toFilterOptions(connectorGroups, draft.connectorGroupIds)}
                onToggle={(id) => setDraft((d) => ({ ...d, connectorGroupIds: toggleSet(d.connectorGroupIds, id) }))}
              />
            </StackItem>
            <StackItem>
              <FilterSection
                label="Segment Groups"
                options={toFilterOptions(segmentGroups, draft.segmentGroupIds)}
                onToggle={(id) => setDraft((d) => ({ ...d, segmentGroupIds: toggleSet(d.segmentGroupIds, id) }))}
              />
            </StackItem>
            <StackItem>
              <FormGroup label="Column Visibility" fieldId="col-vis">
                {([1, 2, 3, 4, 5] as FlowColumn[]).map((col) => (
                  <Checkbox
                    key={col}
                    id={`col-vis-${col}`}
                    label={COLUMN_LABELS[col]}
                    isChecked={draftCols.has(col)}
                    onChange={() => {
                      setDraftCols((prev) => {
                        const next = new Set(prev);
                        if (next.has(col)) next.delete(col);
                        else next.add(col);
                        return next;
                      });
                    }}
                  />
                ))}
              </FormGroup>
            </StackItem>
          </Stack>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={() => { onApply(draft, draftCols); onClose(); }}>
          Apply
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            onApply(EMPTY_FILTERS, new Set([1, 2, 3, 4, 5] as FlowColumn[]));
            onClose();
          }}
        >
          Reset
        </Button>
        <Button variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
