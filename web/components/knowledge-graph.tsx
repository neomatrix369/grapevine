import type { GraphEdge, GraphNode, SampleView } from "@/lib/sample-data";

type KnowledgeGraphProps = {
  view: SampleView;
  caption: string;
  listHint?: boolean;
};

const CX = 220;
const CY = 160;
const VIEW = "0 0 440 340";

function layoutNodes(nodes: GraphNode[]) {
  const count = Math.max(nodes.length, 1);
  const radius = count > 6 ? 140 : 118;
  return nodes.map((node, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const x = CX + radius * Math.cos(angle);
    const y = CY + radius * Math.sin(angle) * 0.82;
    const anchor: "end" | "start" | "middle" = x < CX - 12 ? "end" : x > CX + 12 ? "start" : "middle";
    const lx = x < CX - 12 ? x - 16 : x > CX + 12 ? x + 16 : x;
    const ly = y < CY ? y - 14 : y + 24;
    return { node, x, y, lx, ly, anchor };
  });
}

function LiveGraph({
  nodes,
  edges,
  topicLabel,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  topicLabel: string;
}) {
  const placed = layoutNodes(nodes);
  const byId = new Map(placed.map((item) => [item.node.id, item]));
  const drawn = edges.filter((edge) => byId.has(edge.src) && byId.has(edge.dst));

  return (
    <svg className="graph" width="100%" viewBox={VIEW} role="img" aria-label={`Cognee Cloud graph of ${nodes.length} nodes.`}>
      {drawn.map((edge) => {
        const from = byId.get(edge.src);
        const to = byId.get(edge.dst);
        if (!from || !to) {
          return null;
        }
        return (
          <line
            key={`${edge.src}-${edge.dst}-${edge.kind}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="var(--signal)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        );
      })}
      <circle cx={CX} cy={CY} r="12" fill="var(--signal)" />
      <text x={CX} y={CY + 28} textAnchor="middle" className="mono" stroke="var(--card)" strokeWidth="4" paintOrder="stroke">
        {topicLabel}
      </text>
      {placed.map((item) => (
        <g key={item.node.id}>
          <circle
            cx={item.x}
            cy={item.y}
            r="9"
            fill="var(--signal-soft)"
            stroke="var(--signal-ink)"
            strokeWidth="1.5"
          />
          <text
            x={item.lx}
            y={item.ly}
            textAnchor={item.anchor}
            stroke="var(--card)"
            strokeWidth="4"
            paintOrder="stroke"
          >
            <title>{item.node.fullLabel ?? item.node.label}</title>
            {item.node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function KnowledgeGraph({ view, caption, listHint = false }: KnowledgeGraphProps) {
  if (view.source === "live" && view.graphNodes.length === 0) {
    return <p className="src">Cognee Cloud graph is unreachable. Live rows above are still from Supabase.</p>;
  }

  if (view.graphNodes.length > 0) {
    return (
      <>
        <LiveGraph nodes={view.graphNodes} edges={view.graphEdges} topicLabel={view.topicLabel} />
        <p className="caption">{caption}</p>
      </>
    );
  }

  const people = view.experts.slice(0, 4);
  const nodes = layoutNodes(
    people.map((person) => ({ id: person.id, label: person.name, kind: "person" })),
  ).map((item, index) => ({ ...item, person: people[index] }));
  const aria = listHint
    ? `Graph of ${people.length} experts on ${view.topicLabel}. List view available.`
    : `Graph of ${people.length} experts on ${view.topicLabel}.`;

  return (
    <>
      <svg className="graph" width="100%" viewBox={VIEW} role="img" aria-label={aria}>
        {nodes.map((node) => (
          <line
            key={`spoke-${node.person.id}`}
            x1={CX}
            y1={CY}
            x2={node.x}
            y2={node.y}
            stroke="var(--signal)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        ))}
        <circle cx={CX} cy={CY} r="14" fill="var(--signal)" />
        <text x={CX} y={CY + 30} textAnchor="middle" className="mono" stroke="var(--card)" strokeWidth="4" paintOrder="stroke">
          {view.topicLabel}
        </text>
        {nodes.map((node) => (
          <g key={node.person.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={6 + node.person.answers}
              fill="var(--signal-soft)"
              stroke="var(--signal-ink)"
              strokeWidth="1.5"
            />
            <text
              x={node.lx}
              y={node.ly}
              textAnchor={node.anchor}
              stroke="var(--card)"
              strokeWidth="4"
              paintOrder="stroke"
            >
              <title>{node.person.name}</title>
              {node.person.name} · {node.person.answers}
            </text>
          </g>
        ))}
      </svg>
      <p className="caption">{caption}</p>
    </>
  );
}
