export interface ScimAttrEntry {
  id: string;
  attr: string;
  value: string;
}

export interface FormState {
  scimGroupIDs: string[];
  scimAttrs: ScimAttrEntry[];
  segmentGroupID: string;
  segmentID: string;
  trustedNetwork: string;
  platform: string;
  fqdn: string;
}

export const DEFAULT_FORM: FormState = {
  scimGroupIDs: [],
  scimAttrs: [],
  segmentGroupID: "",
  segmentID: "",
  trustedNetwork: "",
  platform: "",
  fqdn: "",
};

export type StepError = string;

export const validateAccessTarget = (f: FormState): StepError[] => {
  const errs: StepError[] = [];
  if (!f.fqdn && !f.segmentID) errs.push("Select a segment or enter an FQDN.");
  if (f.fqdn && f.segmentID) errs.push("Provide either FQDN or segment, not both.");
  return errs;
};

export const validateClientContext = (f: FormState): StepError[] =>
  f.platform ? [] : ["Pick a platform."];

export interface NamedOption {
  id: string;
  label: string;
}

export interface DualOption {
  id: string;
  text: string;
  selected: boolean;
  isVisible: boolean;
}
