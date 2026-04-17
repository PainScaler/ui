import { useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { COLORS } from "../types";

export interface ModelNodeData {
  ns: keyof typeof COLORS;
  label: string;
  fields: { name: string; type: string }[];
}

export function ModelNode({ data }: NodeProps<ModelNodeData>) {
  const c = COLORS[data.ns] || COLORS.common;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: c.bg,
        border: `1px solid ${hovered ? c.header : c.border}`,
        borderRadius: 8,
        minWidth: 168,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        boxShadow: hovered
          ? `0 0 18px 2px ${c.header}55, 0 2px 12px #00000088`
          : `0 2px 8px #00000066`,
        transition: "box-shadow 0.18s, border-color 0.18s",
        cursor: "default",
      }}
    >
      <Handle type="target" position={Position.Left}  style={{ background: c.header, border: "none", width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: c.header, border: "none", width: 8, height: 8 }} />
      <Handle type="target" position={Position.Top}   style={{ background: c.header, border: "none", width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: c.header, border: "none", width: 8, height: 8 }} />

      <div style={{
        background: c.header,
        borderRadius: "7px 7px 0 0",
        padding: "6px 10px 5px",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}>
        <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", opacity: 0.55 }}>
          {data.ns}
        </span>
      </div>

      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ color: c.text, fontSize: 13, fontWeight: 700, marginBottom: 4, letterSpacing: "0.01em" }}>
          {data.label}
        </div>
        {data.fields && data.fields.length > 0 && (
          <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 6, marginTop: 4 }}>
            {data.fields.map((f) => (
              <div key={f.name} style={{ fontSize: 10, color: c.text, opacity: 0.65, lineHeight: "1.6", display: "flex", gap: 6 }}>
                <span style={{ color: c.header, opacity: 0.9 }}>{f.name}</span>
                <span style={{ opacity: 0.5 }}>{f.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}