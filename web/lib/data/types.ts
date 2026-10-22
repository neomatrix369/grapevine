import type { GraphEdge, GraphNode, SampleView } from "@/lib/sample-data";

export type { DataSource, GraphEdge, GraphNode } from "@/lib/sample-data";

export type LiveStatus = "ok" | "empty" | "unreachable";

export type CommunityResponse = {
  source: "live";
  status: LiveStatus;
  message: string;
  view: SampleView;
};

export type GraphResponse = {
  source: "cognee" | "supabase" | "none";
  nodes: GraphNode[];
  edges: GraphEdge[];
};
