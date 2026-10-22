import type { GraphEdge, GraphNode, SampleView } from "@/lib/sample-data";

type KnowledgeGraphProps = {
  view: SampleView;
  caption: string;
  listHint?: boolean;
};

const CX = 200;
const CY = 150;
const RADIUS = 110;

function layoutNodes(nodes: GraphNode[]) {
  return nodes.map((node, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(nodes.length, 1) + 0.4;
    return { node, x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) * 0.9 };
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
  const shown = nodes.slice(0, 8);
  const placed = layoutNodes(shown);
  const byId = new Map(placed.map((item) => [item.node.id, item]));
  const drawn = edges.filter((edge) => byId.has(edge.src) && byId.has(edge.dst)).slice(0, 24);

  return (
    <svg className="graph" width="100%" viewBox="0 0 400 310" role="img" aria-label={`Cognee Cloud graph of ${shown.length} nodes.`}>
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
      <circle cx={CX} cy={CY} r="14" fill="var(--signal)" />
      <text x={CX} y={CY + 30} textAnchor="middle" className="mono" stroke="var(--card)" strokeWidth="4" paintOrder="stroke">
        {topicLabel}
      </text>
      {placed.map((item) => (
        <g key={item.node.id}>
          <circle
            cx={item.x}
            cy={item.y}
            r="10"
            fill="var(--signal-soft)"
            stroke="var(--signal-ink)"
            strokeWidth="1.5"
          />
          <text
            x={item.x}
            y={item.y - 16}
            textAnchor="middle"
            stroke="var(--card)"
            strokeWidth="4"
            paintOrder="stroke"
          >
            {item.node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function KnowledgeGraph({ view, caption, listHint = false }: KnowledgeGraphProps) {
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
      <svg className="graph" width="100%" viewBox="0 0 400 310" role="img" aria-label={aria}>
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
              x={node.x}
              y={node.y - 12 - node.person.answers}
              textAnchor="middle"
              stroke="var(--card)"
              strokeWidth="4"
              paintOrder="stroke"
            >
              {node.person.name} · {node.person.answers}
            </text>
          </g>
        ))}
        <circle cx={CX} cy={285} r="8" fill="var(--you)" />
        <text x={CX + 14} y={289} style={{ fill: "var(--you)" }}>
          You
        </text>
      </svg>
      <p className="caption">{caption}</p>
    </>
  );
}
