export const ELK_BASE_OPTIONS = {
  "elk.algorithm": "layered",
  "elk.layered.spacing.nodeNodeBetweenLayers": "80",
  "elk.spacing.nodeNode": "40",
  "elk.edgeRouting": "POLYLINE",
};

export const NODE_WIDTH = 200;
export const NODE_HEIGHT_BASE = 62;
export const NODE_HEIGHT_PER_FIELD = 16;

export const COLORS = {
  simulator: { bg: "#1a0a0a", border: "#7b1a12", header: "#a52a20", text: "#f5c6c6" },
  internal:  { bg: "#0d0a1a", border: "#3c3489", header: "#534ab7", text: "#cecbf6" },
  policy:    { bg: "#0a0f1a", border: "#0c447c", header: "#185fa5", text: "#b5d4f4" },
  segment:   { bg: "#041a12", border: "#0f6e56", header: "#1d9e75", text: "#9fe1cb" },
  infra:     { bg: "#1a1000", border: "#633806", header: "#ba7517", text: "#fac775" },
  identity:  { bg: "#111110", border: "#5f5e5a", header: "#444441", text: "#d3d1c7" },
  common:    { bg: "#0a0a0a", border: "#3d3d3a", header: "#2c2c2a", text: "#b4b2a9" },
};

export const NS_ORDER: (keyof typeof COLORS)[] = [
  "simulator",
  "internal",
  "policy",
  "segment",
  "infra",
  "identity",
  "common",
];
