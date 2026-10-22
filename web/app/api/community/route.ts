import { connection } from "next/server";

import { getCommunityData } from "@/lib/data/source";

export async function GET() {
  await connection();
  const payload = await getCommunityData();
  return Response.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
