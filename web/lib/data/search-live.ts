import "server-only";

import { authorLabel, channelDisplayName, shortDate, snippetOf, titleOf } from "@/lib/data/display";
import type { LiveChannel, LivePerson } from "@/lib/data/map-live-view";
import type { AskResponse } from "@/lib/data/types";
import type { KnownThread } from "@/lib/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type { AskResponse };

type RoutedRow = {
  id: string;
  body_snippet: string | null;
  url: string | null;
  channel_id: string;
  thread_id: string | null;
  author_person_id: string | null;
};

type MessageRow = {
  body: string | null;
  ts: string;
  url: string | null;
  channel_id: string;
  author_person_id: string | null;
  thread_id: string | null;
};

async function embedQuestion(text: string): Promise<number[] | null> {
  try {
    const { pipeline } = await import("@huggingface/transformers");
    const extractor = await pipeline("feature-extraction", "Supabase/gte-small");
    const output = await extractor(text.slice(0, 1500), { pooling: "mean", normalize: true });
    return Array.from(output.data as ArrayLike<number>);
  } catch {
    return null;
  }
}

function toMatch(
  body: string | null,
  ts: string | null,
  url: string | null,
  channelId: string,
  authorId: string | null,
  channels: Map<string, LiveChannel>,
  people: Map<string, LivePerson>,
): KnownThread {
  const channel = channels.get(channelId);
  const author = authorId ? people.get(authorId) : undefined;
  return {
    title: titleOf(body),
    snippet: snippetOf(body),
    authorName: authorLabel(author),
    channel: channel
      ? channelDisplayName(channel.channel_name, channel.channel_id)
      : channelDisplayName(channelId, channelId),
    date: shortDate(ts),
    replies: 0,
    url,
  };
}

export async function searchLiveQuestion(question: string): Promise<AskResponse> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { status: "empty", message: "Type a question first.", matches: [] };
  }
  const client = createSupabaseServerClient();
  if (!client) {
    return { status: "unreachable", message: "Supabase keys are missing on the server.", matches: [] };
  }

  const [channels, people] = await Promise.all([
    client.from("channels").select("platform, workspace, channel_id, channel_name, url").limit(200),
    client.from("people").select("person_id, display_name, hidden, last_active_at, messages_4w, active").limit(200),
  ]);
  if (channels.error || people.error) {
    return { status: "unreachable", message: "Live tables are not readable yet.", matches: [] };
  }
  const channelMap = new Map(((channels.data ?? []) as LiveChannel[]).map((row) => [row.channel_id, row]));
  const peopleMap = new Map(((people.data ?? []) as LivePerson[]).map((row) => [row.person_id, row]));

  const embedding = await embedQuestion(trimmed);
  if (embedding) {
    const routed = await client.rpc("route_question", {
      query_text: trimmed,
      query_embedding: embedding,
    });
    if (!routed.error && Array.isArray(routed.data) && routed.data.length) {
      const matches = (routed.data as RoutedRow[]).slice(0, 8).map((row) =>
        toMatch(row.body_snippet, null, row.url, row.channel_id, row.author_person_id, channelMap, peopleMap),
      );
      return { status: "ok", message: "From route_question.", matches };
    }
  }

  const fts = await client
    .from("messages")
    .select("body, ts, url, channel_id, author_person_id, thread_id")
    .textSearch("fts", trimmed, { type: "websearch", config: "english" })
    .limit(8);
  let rows = (fts.data ?? []) as MessageRow[];
  if (!rows.length) {
    const like = await client
      .from("messages")
      .select("body, ts, url, channel_id, author_person_id, thread_id")
      .ilike("body", `%${trimmed.slice(0, 80)}%`)
      .limit(8);
    rows = (like.data ?? []) as MessageRow[];
  }
  if (fts.error && !rows.length) {
    return { status: "unreachable", message: "Search could not read messages.", matches: [] };
  }
  const matches = rows.map((row) =>
    toMatch(row.body, row.ts, row.url, row.channel_id, row.author_person_id, channelMap, peopleMap),
  );
  if (!matches.length) {
    return { status: "no-matches", message: "No matching messages for this question.", matches: [] };
  }
  return { status: "ok", message: "From keyword search.", matches };
}
