import { Handle, Position, type NodeProps } from "reactflow";
import { COLUMN_COLORS, COLUMN_LABELS, type FlowNodeData } from "../buildGraph";

export function FlowNode({ data }: NodeProps<FlowNodeData>) {
  const c = COLUMN_COLORS[data.column];

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 6,
        minWidth: 180,
        fontFamily: "'Inter', sans-serif",
        boxShadow: `0 1px 4px #00000044`,
        cursor: "pointer",
      }}
    >
      {data.column > 1  &&(<Handle type="target" position={Position.Left} style={{ background: c.header, border: "none", width: 7, height: 7 }} />)}
      {data.column < 5 && (<Handle type="source" position={Position.Right} style={{ background: c.header, border: "none", width: 7, height: 7 }} />)}

      <div style={{
        background: c.header,
        borderRadius: "5px 5px 0 0",
        padding: "3px 8px 2px",
      }}>
        <span style={{ color: "#fff", fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.7 }}>
          {COLUMN_LABELS[data.column]}
        </span>
      </div>

      <div style={{ padding: "6px 8px 8px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: c.text, fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>
            {data.label}
          </div>
          {data.subtitle && (
            <div style={{ color: c.text, fontSize: 10, opacity: 0.6, marginTop: 2 }}>
              {data.subtitle}
            </div>
          )}
        </div>
        {data.column === 4 && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            onClick={(e) => {
              e.stopPropagation();
              data.onToggleExpand?.();
            }}
            style={{
              flexShrink: 0,
              opacity: data.expanded ? 0.9 : 0.5,
              transform: data.expanded ? "rotate(90deg)" : "none",
              transition: "transform 0.15s ease, opacity 0.15s ease",
              cursor: "pointer",
            }}
          >
            <path d="M5 3l4 4-4 4" stroke={c.text} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}
