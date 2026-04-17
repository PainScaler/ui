import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
} from "reactflow";
import type { Node, Edge, OnNodesChange, OnEdgesChange } from "reactflow";
import { ModelNode, type ModelNodeData } from "./nodes/ModelNode";
import {
  COLORS,
} from "./types";

const nodeTypes = { model: ModelNode };
const defaultEdgeOptions = { type: "smoothstep" };
interface GraphProps {
  nodes: Node<ModelNodeData>[];
  edges: Edge[];
  activeNs: keyof typeof COLORS | null;
  onEdgesChange: OnEdgesChange;
  onNodesChange: OnNodesChange;
}
export function Graph({
  nodes,
  edges,
  activeNs,
  onNodesChange,
  onEdgesChange,
}: GraphProps) {
  const visibleNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        hidden: activeNs !== null && n.data.ns !== activeNs,
      })),
    [nodes, activeNs],
  );

  const visibleEdges = useMemo(
    () =>
      edges.map((e) => {
        const src = nodes.find((n) => n.id === e.source);
        const tgt = nodes.find((n) => n.id === e.target);
        const hidden =
          activeNs !== null &&
          src?.data.ns !== activeNs &&
          tgt?.data.ns !== activeNs;
        return { ...e, hidden };
      }),
    [edges, nodes, activeNs],
  );

  return (
    <div style={{ width: "100%", height: "100%", background: "var(--pf-t--global--background--color--secondary--default)" }}>
          <ReactFlow
            nodes={visibleNodes}
            edges={visibleEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.15}
            maxZoom={2}
            defaultEdgeOptions={defaultEdgeOptions}
          >
            <Background />
            <Controls />
          </ReactFlow>
    </div>
  );
}
