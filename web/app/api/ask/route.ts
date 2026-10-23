import { connection } from "next/server";

import { searchLiveQuestion } from "@/lib/data/search-live";

export async function POST(request: Request) {
  await connection();
  let question = "";
  try {
    const body = (await request.json()) as { question?: unknown };
    question = typeof body.question === "string" ? body.question : "";
  } catch {
    question = "";
  }
  const payload = await searchLiveQuestion(question);
  return Response.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
