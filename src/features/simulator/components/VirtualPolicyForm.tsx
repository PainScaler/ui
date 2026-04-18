/* eslint-disable react-refresh/only-export-components */
import { useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Label,
  LabelGroup,
  Radio,
  TextInput,
} from "@patternfly/react-core";
import TimesIcon from "@patternfly/react-icons/dist/esm/icons/times-icon";
import { SearchSelect } from "@/shared/ui/SearchSelect";
import type { NamedOption } from "./types";

export interface VirtualPolicyState {
  name: string;
  action: "ALLOW" | "DENY";
  priority: string;
  scimGroupIds: string[];
  segmentIds: string[];
  segmentGroupIds: string[];
}

export const DEFAULT_VIRTUAL_POLICY: VirtualPolicyState = {
  name: "",
  action: "ALLOW",
  priority: "1000",
  scimGroupIds: [],
  segmentIds: [],
  segmentGroupIds: [],
};

export function isVirtualPolicyValid(v: VirtualPolicyState): boolean {
  const hasOperand =
    v.scimGroupIds.length + v.segmentIds.length + v.segmentGroupIds.length > 0;
  const priorityNum = Number(v.priority);
  return Boolean(
    v.name.trim() &&
      (v.action === "ALLOW" || v.action === "DENY") &&
      v.priority &&
      Number.isFinite(priorityNum) &&
      hasOperand,
  );
}

interface Props {
  value: VirtualPolicyState;
  onChange: (patch: Partial<VirtualPolicyState>) => void;
  scimGroups: NamedOption[];
  segments: NamedOption[];
  segmentGroups: NamedOption[];
}

export function VirtualPolicyForm({
  value,
  onChange,
  scimGroups,
  segments,
  segmentGroups,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Virtual Policy</CardTitle>
      </CardHeader>
      <CardBody>
        <Form>
          <FormGroup label="Name" fieldId="vp-name" isRequired>
            <TextInput
              id="vp-name"
              value={value.name}
              onChange={(_, v) => onChange({ name: v })}
              placeholder="e.g. block contractors from prod"
            />
          </FormGroup>

          <FormGroup label="Action" fieldId="vp-action" role="radiogroup" isRequired>
            <Flex spaceItems={{ default: "spaceItemsMd" }}>
              <FlexItem>
                <Radio
                  id="vp-action-allow"
                  name="vp-action"
                  label="ALLOW"
                  isChecked={value.action === "ALLOW"}
                  onChange={() => onChange({ action: "ALLOW" })}
                />
              </FlexItem>
              <FlexItem>
                <Radio
                  id="vp-action-deny"
                  name="vp-action"
                  label="DENY"
                  isChecked={value.action === "DENY"}
                  onChange={() => onChange({ action: "DENY" })}
                />
              </FlexItem>
            </Flex>
          </FormGroup>

          <FormGroup label="Priority" fieldId="vp-priority" isRequired>
            <TextInput
              id="vp-priority"
              type="number"
              value={value.priority}
              onChange={(_, v) => onChange({ priority: v })}
              placeholder="higher = evaluated first"
            />
          </FormGroup>

          <MultiChipSelect
            label="SCIM Groups"
            fieldId="vp-scim"
            options={scimGroups}
            values={value.scimGroupIds}
            onChange={(ids) => onChange({ scimGroupIds: ids })}
            placeholder="Add SCIM group..."
          />
          <MultiChipSelect
            label="Segments"
            fieldId="vp-seg"
            options={segments}
            values={value.segmentIds}
            onChange={(ids) => onChange({ segmentIds: ids })}
            placeholder="Add segment..."
          />
          <MultiChipSelect
            label="Segment Groups"
            fieldId="vp-seggrp"
            options={segmentGroups}
            values={value.segmentGroupIds}
            onChange={(ids) => onChange({ segmentGroupIds: ids })}
            placeholder="Add segment group..."
          />
        </Form>
      </CardBody>
    </Card>
  );
}

// -- Inline chip-based multi-select -------------------------------------------

function MultiChipSelect({
  label,
  fieldId,
  options,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  fieldId: string;
  options: NamedOption[];
  values: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
}) {
  const remaining = useMemo(
    () => options.filter((o) => !values.includes(o.id)),
    [options, values],
  );
  const labels = useMemo(() => {
    const byId = new Map(options.map((o) => [o.id, o.label]));
    return values.map((id) => ({ id, label: byId.get(id) ?? id }));
  }, [options, values]);

  return (
    <FormGroup label={label} fieldId={fieldId}>
      {labels.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <LabelGroup>
            {labels.map((l) => (
              <Label
                key={l.id}
                onClose={() => onChange(values.filter((v) => v !== l.id))}
                closeBtnAriaLabel={`Remove ${l.label}`}
                icon={<TimesIcon />}
              >
                {l.label}
              </Label>
            ))}
          </LabelGroup>
        </div>
      )}
      <SearchSelect
        value=""
        options={remaining}
        onChange={(id) => { if (id) onChange([...values, id]); }}
        placeholder={placeholder}
      />
    </FormGroup>
  );
}
