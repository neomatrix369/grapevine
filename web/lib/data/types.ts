import type { GraphEdge, GraphNode, KnownThread, SampleView } from "@/lib/sample-data";

export type { DataSource, GraphEdge, GraphNode } from "@/lib/sample-data";

export type AskResponse = {
  status: "ok" | "empty" | "unreachable" | "no-matches";
  message: string;
  matches: KnownThread[];
};

export type LiveStatus = "ok" | "empty" | "unreachable";

export type CommunityResponse = {
  source: "live";
  status: LiveStatus;
  message: string;
  graphSource: "cognee" | "supabase" | "none";
  view: SampleView;
};

export type GraphResponse = {
  source: "cognee" | "supabase" | "none";
  nodes: GraphNode[];
  edges: GraphEdge[];
};
