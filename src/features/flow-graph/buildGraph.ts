export type FlowColumn = 1 | 2 | 3 | 4 | 5;

export interface FlowNodeData {
  column: FlowColumn;
  label: string;
  subtitle?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export interface FlowFilters {
  scimGroupIds: Set<string>;
  policyIds: Set<string>;
  connectorGroupIds: Set<string>;
  segmentGroupIds: Set<string>;
}

export const EMPTY_FILTERS: FlowFilters = {
  scimGroupIds: new Set(),
  policyIds: new Set(),
  connectorGroupIds: new Set(),
  segmentGroupIds: new Set(),
};

export const COLUMN_LABELS: Record<FlowColumn, string> = {
  1: "SCIM Groups",
  2: "Access Policies",
  3: "Connector Groups",
  4: "Segment Groups",
  5: "Segments",
};

export const COLUMN_COLORS: Record<FlowColumn, { bg: string; border: string; header: string; text: string }> = {
  1: { bg: "#111110", border: "#5f5e5a", header: "#7a7a72", text: "#d3d1c7" },
  2: { bg: "#0a0f1a", border: "#0c447c", header: "#185fa5", text: "#b5d4f4" },
  3: { bg: "#1a1000", border: "#633806", header: "#ba7517", text: "#fac775" },
  4: { bg: "#041a12", border: "#0f6e56", header: "#1d9e75", text: "#9fe1cb" },
  5: { bg: "#0d0a1a", border: "#3c3489", header: "#534ab7", text: "#cecbf6" },
};



