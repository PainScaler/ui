import { useMemo, useState } from "react";
import {
  Button,
  DualListSelector,
  DualListSelectorControl,
  DualListSelectorControlsWrapper,
  DualListSelectorList,
  DualListSelectorListItem,
  DualListSelectorPane,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  FormFieldGroup,
  FormFieldGroupHeader,
  FormGroup,
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from "@patternfly/react-core";
import AngleDoubleLeftIcon from "@patternfly/react-icons/dist/esm/icons/angle-double-left-icon";
import AngleDoubleRightIcon from "@patternfly/react-icons/dist/esm/icons/angle-double-right-icon";
import AngleLeftIcon from "@patternfly/react-icons/dist/esm/icons/angle-left-icon";
import AngleRightIcon from "@patternfly/react-icons/dist/esm/icons/angle-right-icon";
import MinusCircleIcon from "@patternfly/react-icons/dist/esm/icons/minus-circle-icon";
import PlusCircleIcon from "@patternfly/react-icons/dist/esm/icons/plus-circle-icon";
import SearchIcon from "@patternfly/react-icons/dist/esm/icons/search-icon";
import type { DualOption, NamedOption, ScimAttrEntry } from "./types";

// -- ScimAttrRow --------------------------------------------------------------

function ScimAttrRow({
  entry,
  attrNames,
  onChange,
  onRemove,
}: {
  entry: ScimAttrEntry;
  attrNames: string[];
  onChange: (field: "attr" | "value", val: string) => void;
  onRemove: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () => attrNames.filter((n) => n.toLowerCase().includes(filter.toLowerCase())),
    [attrNames, filter],
  );

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ flex: "0 0 260px" }}>
        <Select
          isOpen={isOpen}
          onOpenChange={(open) => { setIsOpen(open); if (!open) setFilter(""); }}
          onSelect={(_, v) => { onChange("attr", v as string); setIsOpen(false); setFilter(""); }}
          toggle={(ref) => (
            <MenuToggle ref={ref} onClick={() => setIsOpen((o) => !o)} isExpanded={isOpen} isFullWidth>
              {entry.attr || "Select attribute..."}
            </MenuToggle>
          )}
        >
          <div style={{ padding: "8px 8px 4px" }}>
            <SearchInput value={filter} onChange={(_, v) => setFilter(v)} onClear={() => setFilter("")} placeholder="Search..." />
          </div>
          <SelectList>
            {filtered.length === 0 ? (
              <SelectOption isDisabled value="">No results</SelectOption>
            ) : (
              filtered.map((n) => (
                <SelectOption key={n} value={n} isSelected={entry.attr === n}>{n}</SelectOption>
              ))
            )}
          </SelectList>
        </Select>
      </div>
      <TextInput
        value={entry.value}
        onChange={(_, v) => onChange("value", v)}
        placeholder="Value"
        style={{ flex: 1 }}
        aria-label="Attribute value"
      />
      <Button variant="plain" aria-label="Remove" onClick={onRemove} icon={<MinusCircleIcon />} />
    </div>
  );
}

// -- UserIdentitySection ------------------------------------------------------

interface Props {
  allGroups: NamedOption[];
  onGroupsChange: (ids: string[]) => void;
  scimAttrs: ScimAttrEntry[];
  scimAttrNames: string[];
  onAddAttr: () => void;
  onUpdateAttr: (i: number, field: "attr" | "value", val: string) => void;
  onRemoveAttr: (i: number) => void;
}

export function UserIdentitySection({
  allGroups,
  onGroupsChange,
  scimAttrs,
  scimAttrNames,
  onAddAttr,
  onUpdateAttr,
  onRemoveAttr,
}: Props) {
  const [prevAllGroups, setPrevAllGroups] = useState(allGroups);
  const [available, setAvailable] = useState<DualOption[]>(() =>
    allGroups.map((g) => ({ id: g.id, text: g.label, selected: false, isVisible: true })),
  );
  const [chosen, setChosen] = useState<DualOption[]>([]);
  const [availFilter, setAvailFilter] = useState("");
  const [chosenFilter, setChosenFilter] = useState("");

  // Reset when the source list changes (setState-during-render pattern).
  if (allGroups !== prevAllGroups) {
    setPrevAllGroups(allGroups);
    setAvailable(allGroups.map((g) => ({ id: g.id, text: g.label, selected: false, isVisible: true })));
    setChosen([]);
  }

  const notifyChange = (next: DualOption[]) => onGroupsChange(next.map((o) => o.id));

  const moveSelected = (fromAvailable: boolean) => {
    const src = fromAvailable ? [...available] : [...chosen];
    const dst = fromAvailable ? [...chosen] : [...available];
    for (let i = src.length - 1; i >= 0; i--) {
      if (src[i].selected && src[i].isVisible) {
        const [item] = src.splice(i, 1);
        dst.push({ ...item, selected: false });
      }
    }
    if (fromAvailable) { setAvailable(src); setChosen(dst); notifyChange(dst); }
    else               { setChosen(src); setAvailable(dst); notifyChange(src); }
  };

  const moveAll = (fromAvailable: boolean) => {
    if (fromAvailable) {
      const moved = available.filter((o) => o.isVisible);
      const stays = available.filter((o) => !o.isVisible);
      const next = [...chosen, ...moved];
      setAvailable(stays); setChosen(next); notifyChange(next);
    } else {
      const moved = chosen.filter((o) => o.isVisible);
      const stays = chosen.filter((o) => !o.isVisible);
      setAvailable([...available, ...moved]); setChosen(stays); notifyChange(stays);
    }
  };

  const onOptionSelect = (
    _e: React.MouseEvent | React.ChangeEvent | React.KeyboardEvent,
    idx: number,
    isChosen: boolean,
  ) => {
    if (isChosen) setChosen((prev) => prev.map((o, i) => i === idx ? { ...o, selected: !o.selected } : o));
    else setAvailable((prev) => prev.map((o, i) => i === idx ? { ...o, selected: !o.selected } : o));
  };

  const applyFilter = (value: string, isAvail: boolean) => {
    const lower = value.toLowerCase();
    const update = (opts: DualOption[]) =>
      opts.map((o) => ({ ...o, isVisible: value === "" || o.text.toLowerCase().includes(lower) }));
    if (isAvail) { setAvailFilter(value); setAvailable(update); }
    else         { setChosenFilter(value); setChosen(update); }
  };

  const buildSearch = (isAvail: boolean) => (
    <SearchInput
      value={isAvail ? availFilter : chosenFilter}
      onChange={(_, v) => applyFilter(v, isAvail)}
      onClear={() => applyFilter("", isAvail)}
      aria-label={isAvail ? "Search available" : "Search chosen"}
    />
  );

  const buildEmpty = (isAvail: boolean) => (
    <EmptyState titleText="No results" variant={EmptyStateVariant.sm} headingLevel="h4" icon={SearchIcon}>
      <EmptyStateBody>No groups match the filter.</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="link" onClick={() => applyFilter("", isAvail)}>Clear filter</Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );

  const availVisible = available.filter((o) => o.isVisible);
  const chosenVisible = chosen.filter((o) => o.isVisible);

  return (
    <FormFieldGroup
      header={
        <FormFieldGroupHeader titleText={{ text: "User Identity", id: "fg-identity" }} />
      }
    >
      <FormGroup label="SCIM Groups" fieldId="scimGroups">
        <DualListSelector>
          <DualListSelectorPane
            title="Available"
            status={`${available.filter((o) => o.selected && o.isVisible).length} of ${availVisible.length} selected`}
            searchInput={buildSearch(true)}
            listMinHeight="240px"
          >
            {availFilter !== "" && availVisible.length === 0 && buildEmpty(true)}
            <DualListSelectorList>
              {available.map((opt, i) =>
                opt.isVisible ? (
                  <DualListSelectorListItem key={opt.id} isSelected={opt.selected} id={`avail-${opt.id}`} onOptionSelect={(e) => onOptionSelect(e, i, false)}>
                    {opt.text}
                  </DualListSelectorListItem>
                ) : null,
              )}
            </DualListSelectorList>
          </DualListSelectorPane>

          <DualListSelectorControlsWrapper>
            <DualListSelectorControl icon={<AngleRightIcon />} aria-label="Add selected" onClick={() => moveSelected(true)} isDisabled={!available.some((o) => o.selected)} />
            <DualListSelectorControl icon={<AngleDoubleRightIcon />} aria-label="Add all" onClick={() => moveAll(true)} isDisabled={availVisible.length === 0} />
            <DualListSelectorControl icon={<AngleDoubleLeftIcon />} aria-label="Remove all" onClick={() => moveAll(false)} isDisabled={chosenVisible.length === 0} />
            <DualListSelectorControl icon={<AngleLeftIcon />} aria-label="Remove selected" onClick={() => moveSelected(false)} isDisabled={!chosen.some((o) => o.selected)} />
          </DualListSelectorControlsWrapper>

          <DualListSelectorPane
            title="Selected"
            status={`${chosen.filter((o) => o.selected && o.isVisible).length} of ${chosenVisible.length} selected`}
            searchInput={buildSearch(false)}
            listMinHeight="240px"
            isChosen
          >
            {chosenFilter !== "" && chosenVisible.length === 0 && buildEmpty(false)}
            <DualListSelectorList>
              {chosen.map((opt, i) =>
                opt.isVisible ? (
                  <DualListSelectorListItem key={opt.id} isSelected={opt.selected} id={`chosen-${opt.id}`} onOptionSelect={(e) => onOptionSelect(e, i, true)}>
                    {opt.text}
                  </DualListSelectorListItem>
                ) : null,
              )}
            </DualListSelectorList>
          </DualListSelectorPane>
        </DualListSelector>
      </FormGroup>

      <FormGroup label="SCIM Attributes" fieldId="scimAttrs">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scimAttrs.map((entry, i) => (
            <ScimAttrRow
              key={entry.id}
              entry={entry}
              attrNames={scimAttrNames}
              onChange={(field, val) => onUpdateAttr(i, field, val)}
              onRemove={() => onRemoveAttr(i)}
            />
          ))}
          <div>
            <Button variant="link" icon={<PlusCircleIcon />} onClick={onAddAttr}>
              Add attribute
            </Button>
          </div>
        </div>
      </FormGroup>
    </FormFieldGroup>
  );
}
