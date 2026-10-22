import { connection } from "next/server";

import { fetchCogneeGraph } from "@/lib/cognee/client";
import { getCommunityData } from "@/lib/data/source";

export async function GET() {
  await connection();
  const cognee = await fetchCogneeGraph();
  if (cognee.nodes.length) {
    return Response.json(cognee, { headers: { "Cache-Control": "no-store" } });
  }
  const community = await getCommunityData();
  return Response.json(
    {
      source: community.view.graphNodes.length ? "supabase" : "none",
      nodes: community.view.graphNodes,
      edges: community.view.graphEdges,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
