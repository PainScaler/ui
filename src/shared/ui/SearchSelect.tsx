import { useMemo, useState } from "react";
import {
  Button,
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from "@patternfly/react-core";
import TimesIcon from "@patternfly/react-icons/dist/esm/icons/times-icon";
import type { NamedOption } from "@/features/simulator/components/types";

interface SearchSelectProps {
  value: string;
  options: NamedOption[];
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  disabled = false,
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase())),
    [options, filter],
  );

  const selectedLabel = options.find((o) => o.id === value)?.label ?? "";

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <Select
          isOpen={isOpen}
          onOpenChange={(open) => { setIsOpen(open); if (!open) setFilter(""); }}
          onSelect={(_, v) => { onChange(v as string); setIsOpen(false); setFilter(""); }}
          toggle={(ref) => (
            <MenuToggle
              ref={ref}
              onClick={() => !disabled && setIsOpen((o) => !o)}
              isExpanded={isOpen}
              isDisabled={disabled}
              isFullWidth
            >
              {selectedLabel || placeholder}
            </MenuToggle>
          )}
        >
          <div style={{ padding: "8px 8px 4px" }}>
            <SearchInput
              value={filter}
              onChange={(_, v) => setFilter(v)}
              onClear={() => setFilter("")}
              placeholder="Search..."
            />
          </div>
          <SelectList style={{ maxHeight: "40vh", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <SelectOption isDisabled value="">No results</SelectOption>
            ) : (
              filtered.map((o) => (
                <SelectOption key={o.id} value={o.id} isSelected={value === o.id}>
                  {o.label}
                </SelectOption>
              ))
            )}
          </SelectList>
        </Select>
      </div>
      {value && !disabled && (
        <Button
          variant="plain"
          aria-label="Clear selection"
          onClick={() => onChange("")}
          icon={<TimesIcon />}
        />
      )}
    </div>
  );
}

// -- TypeaheadInput -----------------------------------------------------------

interface TypeaheadInputProps {
  value: string;
  suggestions: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}

export function TypeaheadInput({
  value,
  suggestions,
  onChange,
  placeholder = "Type or select...",
}: TypeaheadInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(
    () =>
      value
        ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
        : suggestions,
    [suggestions, value],
  );

  return (
    <Select
      isOpen={isOpen && filtered.length > 0}
      onOpenChange={(open) => setIsOpen(open)}
      onSelect={(_, v) => {
        onChange(v as string);
        setIsOpen(false);
      }}
      toggle={(ref) => (
        <MenuToggle ref={ref} variant="typeahead" isExpanded={isOpen} isFullWidth>
          <TextInputGroup isPlain>
            <TextInputGroupMain
              value={value}
              onChange={(_, v) => {
                onChange(v);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
            />
            {value && (
              <TextInputGroupUtilities>
                <Button
                  variant="plain"
                  aria-label="Clear"
                  onClick={() => {
                    onChange("");
                    setIsOpen(false);
                  }}
                  icon={<TimesIcon />}
                />
              </TextInputGroupUtilities>
            )}
          </TextInputGroup>
        </MenuToggle>
      )}
    >
      <SelectList style={{ maxHeight: "40vh", overflowY: "auto" }}>
        {filtered.map((s) => (
          <SelectOption key={s} value={s}>
            {s}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
}
