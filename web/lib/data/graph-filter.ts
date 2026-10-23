import type { GraphEdge, GraphNode } from "@/lib/sample-data";

const DROP_KIND = /documentchunk|textdocument|document|timestamp|chunk/i;
const ID_LIKE = /^(node|documentchunk_|te?\d{4})|[0-9a-f-]{20,}|\b\d{4}-\d{2}-\d{2}T|\b\d{10,}\b/i;
const MAX_LABEL = 22;
const MAX_NODES = 10;

function isReadableLabel(label: string): boolean {
  const trimmed = label.trim();
  if (trimmed.length < 2 || trimmed === "node") {
    return false;
  }
  if (ID_LIKE.test(trimmed)) {
    return false;
  }
  if (/^documentchunk_/i.test(trimmed)) {
    return false;
  }
  return true;
}

function isEntityNode(node: GraphNode): boolean {
  if (DROP_KIND.test(node.kind)) {
    return false;
  }
  return isReadableLabel(node.label);
}

function truncate(label: string): { label: string; fullLabel: string } {
  const fullLabel = label.trim();
  if (fullLabel.length <= MAX_LABEL) {
    return { label: fullLabel, fullLabel };
  }
  return { label: `${fullLabel.slice(0, MAX_LABEL - 1)}…`, fullLabel };
}

export function sanitizeGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const readable = nodes.filter(isEntityNode);
  const ids = new Set(readable.map((node) => node.id));
  const linked = new Set<string>();
  const keptEdges: GraphEdge[] = [];
  for (const edge of edges) {
    if (!ids.has(edge.src) || !ids.has(edge.dst) || edge.src === edge.dst) {
      continue;
    }
    linked.add(edge.src);
    linked.add(edge.dst);
    keptEdges.push(edge);
  }
  const connected = readable.filter((node) => linked.has(node.id));
  const chosen = (connected.length ? connected : readable).slice(0, MAX_NODES);
  const keep = new Set(chosen.map((node) => node.id));
  return {
    nodes: chosen.map((node) => ({ ...node, ...truncate(node.label) })),
    edges: keptEdges.filter((edge) => keep.has(edge.src) && keep.has(edge.dst)),
  };
}
