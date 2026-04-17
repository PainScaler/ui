import {
  FormFieldGroup,
  FormFieldGroupHeader,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from "@patternfly/react-core";
import { SearchSelect, TypeaheadInput } from "@/shared/ui/SearchSelect";
import type { NamedOption } from "./types";

interface Props {
  fqdn: string;
  fqdnSuggestions: string[];
  onFqdnChange: (v: string) => void;

  segmentGroupID: string;
  segmentGroups: NamedOption[];
  onSegmentGroupChange: (id: string) => void;

  segmentID: string;
  segments: NamedOption[];
  onSegmentChange: (id: string) => void;
}

export function AccessTargetSection({
  fqdn,
  fqdnSuggestions,
  onFqdnChange,
  segmentGroupID,
  segmentGroups,
  onSegmentGroupChange,
  segmentID,
  segments,
  onSegmentChange,
}: Props) {
  return (
    <FormFieldGroup
      header={
        <FormFieldGroupHeader
          titleText={{ text: "Access Target", id: "fg-target" }}
        />
      }
    >
      <FormGroup label="FQDN" fieldId="fqdn">
        <TypeaheadInput
          value={fqdn}
          suggestions={fqdnSuggestions}
          onChange={onFqdnChange}
          placeholder="e.g. app.internal.example.com"
        />
      </FormGroup>

      <FormGroup label="Segment Group" fieldId="segmentGroupID">
        <SearchSelect
          value={segmentGroupID}
          options={segmentGroups}
          onChange={onSegmentGroupChange}
          placeholder="Select segment group..."
          disabled={!!segmentID}
        />
      </FormGroup>

      <FormGroup label="Segment" fieldId="segmentID">
        <SearchSelect
          value={segmentID}
          options={segments}
          onChange={onSegmentChange}
          placeholder="Select segment..."
        />
        {segmentGroupID && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem>Filtered by selected group</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
    </FormFieldGroup>
  );
}
