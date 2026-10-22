import type { SampleView } from "@/lib/sample-data";

type KnowledgeGraphProps = {
  view: SampleView;
  caption: string;
  listHint?: boolean;
};

export function KnowledgeGraph({ view, caption, listHint = false }: KnowledgeGraphProps) {
  const people = view.experts.slice(0, 4);
  const cx = 200;
  const cy = 150;
  const radius = 110;
  const nodes = people.map((person, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / people.length + 0.4;
    return { person, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) * 0.9 };
  });
  const aria = listHint
    ? `Graph of ${people.length} experts on ${view.topicLabel}. List view available.`
    : `Graph of ${people.length} experts on ${view.topicLabel}.`;

  return (
    <>
      <svg className="graph" width="100%" viewBox="0 0 400 310" role="img" aria-label={aria}>
        {nodes.map((node) => (
          <line
            key={`spoke-${node.person.id}`}
            x1={cx}
            y1={cy}
            x2={node.x}
            y2={node.y}
            stroke="var(--signal)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
        ))}
        <circle cx={cx} cy={cy} r="14" fill="var(--signal)" />
        <text x={cx} y={cy + 30} textAnchor="middle" className="mono" stroke="var(--card)" strokeWidth="4" paintOrder="stroke">
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
        <circle cx={cx} cy={285} r="8" fill="var(--you)" />
        <text x={cx + 14} y={289} style={{ fill: "var(--you)" }}>
          You
        </text>
      </svg>
      <p className="caption">{caption}</p>
    </>
  );
}
