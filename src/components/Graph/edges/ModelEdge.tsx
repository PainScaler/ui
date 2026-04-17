import { MarkerType } from "reactflow";

export function edge(
  id: string,
  source: string,
  target: string,
  label: string,
  color = "#555",
) {
  return {
    id,
    source,
    target,
    label,
    labelStyle: {
      fill: color,
      fontSize: 9,
      fontFamily: "'JetBrains Mono', monospace",
    },
    labelBgStyle: { fill: "#0a0a0a", fillOpacity: 0.85 },
    labelBgPadding: [3, 4] as [number, number],
    style: { stroke: color, strokeWidth: 1.2 },
    markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
    type: "smoothstep",
  };
}
