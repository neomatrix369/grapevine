import "server-only";

import { fetchCogneeGraph } from "@/lib/cognee/client";
import { mapLiveView, type LiveTables } from "@/lib/data/map-live-view";
import type { CommunityResponse, GraphEdge, GraphNode, GraphResponse } from "@/lib/data/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMPTY: LiveTables = {
  channels: [],
  people: [],
  messages: [],
  rules: [],
  coverage: [],
  posts: [],
};

type ServerClient = NonNullable<ReturnType<typeof createSupabaseServerClient>>;

function unreachable(message: string, graph: GraphResponse): CommunityResponse {
  return {
    source: "live",
    status: "unreachable",
    message,
    graphSource: graph.source,
    view: mapLiveView(EMPTY, graph),
  };
}

async function selectRows<T>(
  client: ServerClient,
  table: string,
  columns: string,
  order?: { column: string; ascending: boolean; limit: number },
): Promise<{ rows: T[]; error: string | null }> {
  let query = client.from(table).select(columns);
  if (order) {
    query = query.order(order.column, { ascending: order.ascending }).limit(order.limit);
  } else {
    query = query.limit(200);
  }
  const { data, error } = await query;
  if (error) {
    return { rows: [], error: error.code ?? "query-failed" };
  }
  return { rows: (data ?? []) as T[], error: null };
}

async function fetchSupabaseGraph(client: ServerClient): Promise<GraphResponse> {
  const nodes = await selectRows<GraphNode>(client, "graph_nodes", "id, kind, label");
  const edges = await selectRows<GraphEdge>(client, "graph_edges", "src, dst, kind");
  if (!nodes.rows.length) {
    return { source: "none", nodes: [], edges: [] };
  }
  return { source: "supabase", nodes: nodes.rows, edges: edges.rows };
}

export async function getCommunityData(): Promise<CommunityResponse> {
  const client = createSupabaseServerClient();
  if (!client) {
    return unreachable("Supabase keys are missing on the server.", { source: "none", nodes: [], edges: [] });
  }

  const [channels, people, messages, rules, coverage, posts] = await Promise.all([
    selectRows<LiveTables["channels"][number]>(
      client,
      "channels",
      "platform, workspace, channel_id, channel_name, url",
    ),
    selectRows<LiveTables["people"][number]>(
      client,
      "people",
      "person_id, display_name, hidden, last_active_at, messages_4w, active",
    ),
    selectRows<LiveTables["messages"][number]>(
      client,
      "messages",
      "body, ts, url, channel_id, author_person_id, platform, thread_id",
      { column: "ts", ascending: false, limit: 200 },
    ),
    selectRows<LiveTables["rules"][number]>(client, "rules", "rule_id, text, workspace, scope, channel_id"),
    selectRows<LiveTables["coverage"][number]>(
      client,
      "coverage",
      "platform, channel_id, threads_read, messages_read, status, cutoff, newest_read",
    ),
    selectRows<LiveTables["posts"][number]>(
      client,
      "my_posts",
      "kind, text, channel, workspace, at, source, tagged, replies, status, answered_by, reactions",
    ),
  ]);

  if (channels.error || people.error || messages.error) {
    const cognee = await fetchCogneeGraph();
    return unreachable("Supabase schema is missing or the live tables are not readable yet.", cognee);
  }

  const tables: LiveTables = {
    channels: channels.rows,
    people: people.rows,
    messages: messages.rows,
    rules: rules.rows,
    coverage: coverage.rows,
    posts: posts.rows,
  };

  const cognee = await fetchCogneeGraph();
  const graph = cognee.nodes.length ? cognee : await fetchSupabaseGraph(client);
  const empty = tables.channels.length === 0 && tables.messages.length === 0;
  const view = mapLiveView(tables, graph);
  const liveLine = `Live · ${view.sourceLabel}, last 14 days`;
  const message = empty
    ? "No live rows in Supabase yet. Sample still has the demo path."
    : graph.source === "none"
      ? `${liveLine}. Cognee Cloud graph is unreachable.`
      : liveLine;
  return {
    source: "live",
    status: empty ? "empty" : "ok",
    message,
    graphSource: graph.source,
    view,
  };
}
