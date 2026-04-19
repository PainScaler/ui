import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
  type Edge,
} from "reactflow";
import { createPortal } from "react-dom";
import { Alert, Bullseye, Spinner } from "@patternfly/react-core";
import type { NamedOption } from "@/features/simulator/components/types";
import "reactflow/dist/style.css";
import "@/features/flow-graph/flow.css";
import { useFlowGraph, useRoutes } from "@/shared/api/queries";
import { FlowNode } from "@/features/flow-graph/nodes/FlowNode";
import type { FlowColumn, FlowFilters, FlowNodeData } from "@/features/flow-graph/buildGraph";
import { EMPTY_FILTERS } from "@/features/flow-graph/buildGraph";
import { FilterModal } from "@/features/flow-graph/FilterModal";
import { Button } from "@patternfly/react-core";
import FilterIcon from "@patternfly/react-icons/dist/esm/icons/filter-icon";
import { analysis } from "@/shared/api/models.gen";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dagre from "@dagrejs/dagre";

const nodeTypes = { flow: FlowNode };
const defaultEdgeOptions = { type: "smoothstep" };

function useElementSize(selector: string, dimension: "width" | "height"): number {
  const [size, setSize] = useState(0);
  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    const measure = () => {
      // eslint-disable-next-line react-x/set-state-in-effect
      setSize(dimension === "width" ? el.offsetWidth : el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selector, dimension]);
  return size;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

// Map graph node ID (e.g. "p:123") to the route column key + raw ID
const NODE_PREFIX_TO_COL: Record<string, string> = {
  "g:": "scimGroup",
  "p:": "policy",
  "cg:": "connectorGroup",
  "sg:": "segmentGroup",
  "s:": "segment",
};

function nodeIdToRouteKey(nodeId: string): { col: string; rawId: string } | null {
  for (const [prefix, col] of Object.entries(NODE_PREFIX_TO_COL)) {
    if (nodeId.startsWith(prefix)) {
      return { col, rawId: nodeId.slice(prefix.length) };
    }
  }
  return null;
}

// Given a set of clicked nodes, find all routes containing any of them,
// then collect the union of graph node IDs and edge IDs on those routes.
function findRouteHighlight(
  nodeIds: Set<string>,
  routes: analysis.Route[],
): { nodes: Set<string>; edges: Set<string> } {
  const reachNodes = new Set<string>();
  const reachEdges = new Set<string>();
  if (nodeIds.size === 0) return { nodes: reachNodes, edges: reachEdges };

  const keys = Array.from(nodeIds)
    .map((id) => nodeIdToRouteKey(id))
    .filter((k): k is NonNullable<typeof k> => k !== null);
  if (keys.length === 0) return { nodes: reachNodes, edges: reachEdges };

  const matching = routes.filter((r) =>
    keys.some((k) => {
      const entry = r[k.col as keyof analysis.Route] as analysis.RouteEntry | undefined;
      return entry?.id === k.rawId;
    }),
  );

  for (const route of matching) {
    const ids: string[] = [];
    if (route.scimGroup?.id) { const nid = "g:" + route.scimGroup.id; reachNodes.add(nid); ids.push(nid); }
    if (route.policy?.id) { const nid = "p:" + route.policy.id; reachNodes.add(nid); ids.push(nid); }
    if (route.connectorGroup?.id) { const nid = "cg:" + route.connectorGroup.id; reachNodes.add(nid); ids.push(nid); }
    if (route.segmentGroup?.id) { const nid = "sg:" + route.segmentGroup.id; reachNodes.add(nid); ids.push(nid); }
    if (route.segment?.id) { const nid = "s:" + route.segment.id; reachNodes.add(nid); ids.push(nid); }
    for (let i = 0; i < ids.length - 1; i++) {
      reachEdges.add(ids[i] + "->" + ids[i + 1]);
    }
  }

  return { nodes: reachNodes, edges: reachEdges };
}

function layoutElements(
  fgraph: analysis.FlowGraph,
): { nodes: Node[]; edges: Edge[] } {
  const srcNodes = fgraph.nodes ?? [];
  const srcEdges = fgraph.edges ?? [];

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "LR",
    nodesep: 40,
    ranksep: 350,
    edgesep: 20,
    ranker: "tight-tree",
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const n of srcNodes) {
    g.setNode(n.id, { width: n.width || NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const e of srcEdges) {
    g.setEdge(e.source, e.target);
  }

  /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  dagre.layout(g);

  const nodes: Node[] = srcNodes.map((src) => {
    const laid = g.node(src.id);
    const w = laid?.width ?? src.width ?? NODE_WIDTH;
    const h = laid?.height ?? NODE_HEIGHT;
    return {
      id: src.id,
      type: src.type ?? "flow",
      position: { x: (laid?.x ?? 0) - w / 2, y: (laid?.y ?? 0) - h / 2 },
      data: src.data ?? {},
      width: w,
      height: h,
    };
  });
  /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

  const edges: Edge[] = srcEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
  }));

  return { nodes, edges };
}

function FlowGraphInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [layoutReady, setLayoutReady] = useState(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FlowFilters>(EMPTY_FILTERS);
  const [visibleCols, setVisibleCols] = useState<Set<FlowColumn>>(() => new Set([1, 2, 3, 4, 5]));
  const { fitView } = useReactFlow();

  const { data: graph, error, isLoading } = useFlowGraph(new analysis.GraphQueryBody({}));
  const { data: routeData } = useRoutes();
  const topOffset = useElementSize(".pf-v6-c-masthead", "height");
  const leftOffset = useElementSize(".pf-v6-c-page__sidebar", "width");

  const groupToSegments = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of graph?.edges ?? []) {
      if (e.source.startsWith("sg:") && e.target.startsWith("s:")) {
        let set = map.get(e.source);
        if (!set) {
          set = new Set();
          map.set(e.source, set);
        }
        set.add(e.target);
      }
    }
    return map;
  }, [graph]);

  const filterOptions = useMemo(() => {
    const pick = (prefix: string): NamedOption[] => {
      const out: NamedOption[] = [];
      const seen = new Set<string>();
      for (const n of graph?.nodes ?? []) {
        if (!n.id.startsWith(prefix)) continue;
        const id = n.id.slice(prefix.length);
        if (seen.has(id)) continue;
        seen.add(id);
        const d = n.data as FlowNodeData | undefined;
        out.push({ id, label: String(d?.label ?? id) });
      }
      return out.sort((a, b) => a.label.localeCompare(b.label));
    };
    return {
      scimGroups: pick("g:"),
      policies: pick("p:"),
      connectorGroups: pick("cg:"),
      segmentGroups: pick("sg:"),
    };
  }, [graph]);

  const visibleGraph = useMemo(() => {
    if (!graph) return null;
    const hiddenSegments = new Set<string>();
    for (const [gid, segs] of groupToSegments) {
      if (!expandedGroupIds.has(gid)) segs.forEach((s) => hiddenSegments.add(s));
    }
    const colOfPrefix = (id: string): FlowColumn | null => {
      if (id.startsWith("g:")) return 1;
      if (id.startsWith("p:")) return 2;
      if (id.startsWith("cg:")) return 3;
      if (id.startsWith("sg:")) return 4;
      if (id.startsWith("s:")) return 5;
      return null;
    };
    const filterHit = (nid: string): boolean => {
      if (nid.startsWith("g:") && filters.scimGroupIds.size > 0)
        return filters.scimGroupIds.has(nid.slice(2));
      if (nid.startsWith("p:") && filters.policyIds.size > 0)
        return filters.policyIds.has(nid.slice(2));
      if (nid.startsWith("cg:") && filters.connectorGroupIds.size > 0)
        return filters.connectorGroupIds.has(nid.slice(3));
      if (nid.startsWith("sg:") && filters.segmentGroupIds.size > 0)
        return filters.segmentGroupIds.has(nid.slice(3));
      return true;
    };
    const keep = (nid: string) => {
      if (hiddenSegments.has(nid)) return false;
      const col = colOfPrefix(nid);
      if (col !== null && !visibleCols.has(col)) return false;
      return filterHit(nid);
    };
    const vNodes = (graph.nodes ?? []).filter((n) => keep(n.id));
    const vEdges = (graph.edges ?? []).filter(
      (e) => keep(e.source) && keep(e.target),
    );
    return { nodes: vNodes, edges: vEdges } as analysis.FlowGraph;
  }, [graph, groupToSegments, expandedGroupIds, filters, visibleCols]);

  const toggleExpand = useCallback((gid: string) => {
    setSelectedIds(new Set());
    setExpandedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  }, []);

  const lastGraphRef = useRef<analysis.FlowGraph | null>(null);

  useEffect(() => {
    if (!visibleGraph) return;
    const isNewGraph = lastGraphRef.current !== graph;
    lastGraphRef.current = graph ?? null;
    // eslint-disable-next-line react-x/set-state-in-effect
    setLayoutReady(false);
    const { nodes: ln, edges: le } = layoutElements(visibleGraph);
    const enriched = ln.map((n) =>
      n.id.startsWith("sg:")
        ? {
            ...n,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: {
              ...n.data,
              expanded: expandedGroupIds.has(n.id),
              onToggleExpand: () => toggleExpand(n.id),
            },
          }
        : n,
    );
    setNodes(enriched);
    setEdges(le);
    // eslint-disable-next-line react-x/set-state-in-effect
    setLayoutReady(true);
    if (isNewGraph) window.requestAnimationFrame(() => fitView());
  }, [visibleGraph, graph, expandedGroupIds, toggleExpand]); // eslint-disable-line react-x/exhaustive-deps

  const routes = useMemo(() => routeData?.routes ?? [], [routeData]);

  // Pull searchable text from the raw graph — NOT from mutable `nodes` state,
  // or the effect below that rewrites node className churns nodes → memo
  // recomputes → effect re-runs forever.
  const searchIndex = useMemo(() => {
    return (visibleGraph?.nodes ?? []).map((n) => {
      const d = n.data as FlowNodeData | undefined;
      const text = (
        String(d?.label ?? "") +
        " " +
        String(d?.subtitle ?? "")
      ).toLowerCase();
      return { id: n.id, text };
    });
  }, [visibleGraph]);

  const searchMatchIds = useMemo(() => {
    const set = new Set<string>();
    const q = searchTerm.trim().toLowerCase();
    if (!q) return set;
    for (const { id, text } of searchIndex) {
      if (text.includes(q)) set.add(id);
    }
    return set;
  }, [searchIndex, searchTerm]);

  // Zoom to the matches so the user actually sees them, not just the class.
  useEffect(() => {
    if (searchMatchIds.size === 0) return;
    fitView({
      nodes: Array.from(searchMatchIds).map((id) => ({ id })),
      padding: 0.3,
      duration: 400,
    });
  }, [searchMatchIds, fitView]);

  useEffect(() => {
    const reach = findRouteHighlight(selectedIds, routes);
    const hasSelection = selectedIds.size > 0;
    const hasSearch = searchMatchIds.size > 0 || searchTerm.trim().length > 0;

    setNodes((ns) =>
      ns.map((n) => {
        const classes: string[] = [];
        const inReach = reach.nodes.has(n.id);
        const isMatch = searchMatchIds.has(n.id);
        const isSelected = selectedIds.has(n.id);

        let faded = false;
        if (hasSelection && !inReach) faded = true;
        if (hasSearch && !isMatch && !isSelected) faded = true;

        if (faded) classes.push("flow-node--faded");
        if (isMatch) classes.push("flow-node--search-match");
        if (isSelected) classes.push("flow-node--selected");

        return { ...n, className: classes.join(" ") || undefined };
      }),
    );
    setEdges((es) =>
      es.map((e) => {
        if (!hasSelection) return { ...e, className: undefined, animated: false };
        const on = reach.edges.has(e.id);
        return {
          ...e,
          className: on ? "flow-edge--highlighted" : "flow-edge--faded",
          animated: on,
        };
      }),
    );
  }, [selectedIds, searchMatchIds, searchTerm, routes, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (e: React.MouseEvent, node: Node) => {
      const multi = e.ctrlKey || e.metaKey;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (multi) {
          if (next.has(node.id)) next.delete(node.id);
          else next.add(node.id);
          return next;
        }
        if (next.size === 1 && next.has(node.id)) return new Set();
        return new Set([node.id]);
      });
    },
    [],
  );

  const onPaneClick = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchTerm("");
        setSelectedIds(new Set());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bg = "var(--pf-t--global--background--color--secondary--default)";

  const containerStyle: React.CSSProperties = {
    width: `calc(100% - ${leftOffset}px)`,
    height: `calc(100% - ${topOffset}px)`,
    marginTop: topOffset,
    marginLeft: leftOffset,
    background: bg,
    position: "relative",
  };

  if (isLoading || !layoutReady) return <Bullseye style={containerStyle}><Spinner size="xl" /></Bullseye>;
  if (error) return <Bullseye style={containerStyle}><Alert variant="danger" isInline title={String(error)} /></Bullseye>;

  return (
    <div style={containerStyle}>
      <div className={`flow-filter-overlay${isFilterOpen ? " flow-filter-overlay--active" : ""}`}>
        <Button
          variant="secondary"
          icon={<FilterIcon />}
          onClick={() => setIsFilterOpen(true)}
          aria-label="Graph filters"
        >
          <span className="flow-filter-label">Filters</span>
        </Button>
      </div>
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        visibleCols={visibleCols}
        onApply={(f, cols) => { setFilters(f); setVisibleCols(cols); }}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchMatchCount={searchMatchIds.size}
        scimGroups={filterOptions.scimGroups}
        policies={filterOptions.policies}
        connectorGroups={filterOptions.connectorGroups}
        segmentGroups={filterOptions.segmentGroups}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.05}
        maxZoom={2}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export const FlowGraphPage: React.FunctionComponent = () => {
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 150 }}>
      <ReactFlowProvider>
        <FlowGraphInner />
      </ReactFlowProvider>
    </div>,
    document.body,
  );
};
