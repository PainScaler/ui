import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
} from "@patternfly/react-core";
import type { FormState, NamedOption } from "./types";

interface Props {
  form: FormState;
  segmentGroups: NamedOption[];
  segments: NamedOption[];
  allGroups: NamedOption[];
  trustedNetworks: NamedOption[];
  fqdnSuggestions: string[];
}

export function SimContextSummary({
  form,
  segmentGroups,
  segments,
  allGroups,
  trustedNetworks,
}: Props) {
  const segGroupName = segmentGroups.find((g) => g.id === form.segmentGroupID)?.label ?? form.segmentGroupID;
  const segName = segments.find((s) => s.id === form.segmentID)?.label ?? form.segmentID;
  const groupNames = form.scimGroupIDs
    .map((id) => allGroups.find((g) => g.id === id)?.label ?? id)
    .filter(Boolean);
  const netName = trustedNetworks.find((n) => n.id === form.trustedNetwork)?.label ?? form.trustedNetwork;

  return (
    <DescriptionList isHorizontal columnModifier={{ default: "2Col" }}>
      <DescriptionListGroup>
        <DescriptionListTerm>FQDN</DescriptionListTerm>
        <DescriptionListDescription>{form.fqdn || "-"}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Segment Group</DescriptionListTerm>
        <DescriptionListDescription>{form.segmentGroupID ? segGroupName : "-"}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Segment</DescriptionListTerm>
        <DescriptionListDescription>{form.segmentID ? segName : "-"}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>SCIM Groups</DescriptionListTerm>
        <DescriptionListDescription>
          {groupNames.length > 0 ? (
            <LabelGroup>
              {groupNames.map((n) => (
                <Label key={n} isCompact>{n}</Label>
              ))}
            </LabelGroup>
          ) : "-"}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {form.scimAttrs.length > 0 && (
        <DescriptionListGroup>
          <DescriptionListTerm>SCIM Attributes</DescriptionListTerm>
          <DescriptionListDescription>
            <LabelGroup>
              {form.scimAttrs.filter((a) => a.attr).map((a) => (
                <Label key={a.id} isCompact>{a.attr} = {a.value}</Label>
              ))}
            </LabelGroup>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>Platform</DescriptionListTerm>
        <DescriptionListDescription>{form.platform || "-"}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Trusted Network</DescriptionListTerm>
        <DescriptionListDescription>{form.trustedNetwork ? netName : "-"}</DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
}
