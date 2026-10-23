import { describe, expect, it } from "vitest";

import { sanitizeGraph } from "./graph-filter";

describe("sanitizeGraph", () => {
  it("keeps people and topics, drops chunks, timestamps and isolated nodes", () => {
    const graph = sanitizeGraph(
      [
        { id: "p1", label: "Ada Quill", kind: "person" },
        { id: "t1", label: "vector search", kind: "topic" },
        { id: "c1", label: "DocumentChunk_ab12", kind: "DocumentChunk" },
        { id: "c2", label: "2026-10-08T12:00:00Z", kind: "timestamp" },
        { id: "u1", label: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", kind: "entity" },
        { id: "lone", label: "Orphan Topic", kind: "topic" },
      ],
      [
        { src: "p1", dst: "t1", kind: "knows" },
        { src: "c1", dst: "t1", kind: "mentions" },
      ],
    );
    expect(graph.nodes.map((node) => node.label)).toEqual(["Ada Quill", "vector search"]);
    expect(graph.edges).toEqual([{ src: "p1", dst: "t1", kind: "knows" }]);
  });

  it("truncates long labels and keeps the full text for a tooltip", () => {
    const graph = sanitizeGraph(
      [
        { id: "a", label: "A very long expert name that should ellipsis", kind: "person" },
        { id: "b", label: "Supabase", kind: "topic" },
      ],
      [{ src: "a", dst: "b", kind: "knows" }],
    );
    expect(graph.nodes[0].label.endsWith("…")).toBe(true);
    expect(graph.nodes[0].fullLabel).toBe("A very long expert name that should ellipsis");
  });
});
