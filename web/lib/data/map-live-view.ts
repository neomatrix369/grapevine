import type { GraphEdge, GraphNode } from "@/lib/data/types";
import type {
  ChannelRow,
  CoverageRow,
  CoverageStatus,
  MyPost,
  Person,
  PostStatus,
  SampleView,
} from "@/lib/sample-data";

export type LiveChannel = {
  platform: string;
  workspace: string;
  channel_id: string;
  channel_name: string;
};

export type LivePerson = {
  person_id: string;
  display_name: string;
  hidden: boolean;
  last_active_at: string | null;
  messages_4w: number;
  active: boolean;
};

export type LiveMessage = {
  body: string | null;
  ts: string;
  url: string | null;
  channel_id: string;
  author_person_id: string | null;
  platform: string;
};

export type LiveRule = {
  rule_id: string;
  text: string;
  workspace: string;
  scope: string;
  channel_id: string | null;
};

export type LiveCoverage = {
  platform: string;
  channel_id: string;
  threads_read: number;
  messages_read: number;
  status: string;
  cutoff: string | null;
  newest_read: string | null;
};

export type LivePost = {
  kind: string;
  text: string;
  channel: string | null;
  workspace: string | null;
  at: string;
  source: string;
  tagged: string[] | null;
  replies: number;
  status: string;
  answered_by: string | null;
  reactions: number | null;
};

export type LiveTables = {
  channels: LiveChannel[];
  people: LivePerson[];
  messages: LiveMessage[];
  rules: LiveRule[];
  coverage: LiveCoverage[];
  posts: LivePost[];
};

function displayChannelName(name: string): string {
  const cleaned = name.replace(/^unread,\s*/i, "").replace(/\s*\([^)]*\)\s*$/g, "").trim();
  return cleaned || name;
}

function shortDate(iso: string | null | undefined): string {
  if (!iso) {
    return "unknown";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function snippetOf(body: string | null): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  if (!text) {
    return "No message text.";
  }
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

function titleOf(body: string | null): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  if (!text) {
    return "Untitled message";
  }
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

function isCoverageStatus(value: string): value is CoverageStatus {
  return value === "read" || value === "partial" || value === "unread";
}

function isPostStatus(value: string): value is PostStatus {
  return value === "awaiting" || value === "answered" || value === "replied" || value === "no-reply";
}

function channelLookup(channels: LiveChannel[]): Map<string, LiveChannel> {
  return new Map(channels.map((row) => [row.channel_id, row]));
}

function personLookup(people: LivePerson[]): Map<string, LivePerson> {
  return new Map(people.map((row) => [row.person_id, row]));
}

function toPerson(row: LivePerson, channelsByAuthor: Map<string, string[]>): Person {
  const chans = channelsByAuthor.get(row.person_id) ?? [];
  const listed = chans.slice(0, 3).map((name) => `#${name}`).join(", ");
  const answers = row.messages_4w;
  return {
    id: row.person_id,
    name: row.display_name,
    initials: initialsOf(row.display_name),
    answers,
    answersLine: listed ? `${answers} messages in ${listed}` : `${answers} messages`,
    lastActive: shortDate(row.last_active_at),
    active: row.active,
    goto: answers >= 2 ? "active in live channels" : "not enough messages to call go-to",
    roles: [],
  };
}

function coverageStatus(value: string): CoverageStatus {
  return isCoverageStatus(value) ? value : "unread";
}

export function mapLiveView(
  tables: LiveTables,
  graph: { nodes: GraphNode[]; edges: GraphEdge[] },
): SampleView {
  const visiblePeople = tables.people.filter((person) => !person.hidden);
  const channels = channelLookup(tables.channels);
  const peopleById = personLookup(visiblePeople);
  const channelsByAuthor = new Map<string, string[]>();
  for (const message of tables.messages) {
    if (!message.author_person_id) {
      continue;
    }
    const channel = channels.get(message.channel_id);
    const name = displayChannelName(channel?.channel_name ?? message.channel_id);
    const current = channelsByAuthor.get(message.author_person_id) ?? [];
    if (!current.includes(name)) {
      current.push(name);
    }
    channelsByAuthor.set(message.author_person_id, current);
  }

  const experts = visiblePeople
    .slice()
    .sort((a, b) => b.messages_4w - a.messages_4w)
    .slice(0, 8)
    .map((row) => toPerson(row, channelsByAuthor));

  const coverageRows: CoverageRow[] = tables.coverage.map((row) => {
    const channel = channels.get(row.channel_id);
    return {
      channel_name: displayChannelName(channel?.channel_name ?? row.channel_id),
      workspace: channel?.workspace ?? row.platform,
      threads_read: row.threads_read || row.messages_read,
      status: coverageStatus(row.status),
    };
  });

  const postCandidates: ChannelRow[] = tables.channels.slice(0, 6).map((row) => {
    const cover = tables.coverage.find((item) => item.channel_id === row.channel_id);
    return {
      name: displayChannelName(row.channel_name),
      workspace: row.workspace,
      threads: cover ? cover.threads_read || cover.messages_read : null,
      status: coverageStatus(cover?.status ?? "unread"),
    };
  });

  const newest = tables.messages[0];
  const newestChannel = newest ? channels.get(newest.channel_id) : undefined;
  const newestAuthor = newest?.author_person_id ? peopleById.get(newest.author_person_id) : undefined;
  const busiest = tables.coverage.slice().sort((a, b) => b.messages_read - a.messages_read)[0];
  const bestChannel = busiest ? channels.get(busiest.channel_id) : tables.channels[0];
  const readCount = tables.coverage.filter((row) => row.status === "read" || row.status === "partial").length;
  const unread = coverageRows.find((row) => row.status === "unread");
  const cutoffIso = tables.coverage.find((row) => row.cutoff)?.cutoff ?? newest?.ts ?? null;
  const topicChannel = displayChannelName(bestChannel?.channel_name ?? "community");
  const libraryThreads = tables.messages.slice(0, 8).map((message) => {
    const channel = channels.get(message.channel_id);
    const author = message.author_person_id ? peopleById.get(message.author_person_id) : undefined;
    return {
      title: titleOf(message.body),
      authorName: author?.display_name ?? "unknown",
      channel: displayChannelName(channel?.channel_name ?? message.channel_id),
      date: shortDate(message.ts),
      replies: 0,
    };
  });
  const rule = tables.rules[0];
  const posts: MyPost[] = tables.posts.map((post) => ({
    kind: post.kind === "announce" ? "announce" : "question",
    text: post.text,
    channel: post.channel ?? topicChannel,
    workspace: post.workspace ?? "live",
    at: shortDate(post.at),
    source: post.source === "read" ? "read" : "grapevine",
    tagged: post.tagged ?? [],
    replies: post.replies,
    status: isPostStatus(post.status) ? post.status : "awaiting",
    answeredBy: post.answered_by ?? undefined,
    reactions: post.reactions ?? undefined,
  }));
  const weeks = coverageRows.slice(0, 4).map((row) => ({
    label: `#${row.channel_name}`,
    n: row.threads_read,
  }));
  const graphNodes = graph.nodes.slice(0, 12);
  const graphIds = new Set(graphNodes.map((node) => node.id));
  const graphEdges = graph.edges
    .filter((edge) => graphIds.has(edge.src) && graphIds.has(edge.dst))
    .slice(0, 24);

  return {
    source: "live",
    me: { name: "Live" },
    question: newest ? titleOf(newest.body) : "What is this community talking about?",
    announceDraft: newest ? snippetOf(newest.body) : "No live announcement loaded.",
    cutoff: shortDate(cutoffIso),
    channelsRead: readCount,
    channelsTotal: Math.max(tables.channels.length, tables.coverage.length),
    known: {
      title: newest ? titleOf(newest.body) : "No live messages yet",
      snippet: newest ? snippetOf(newest.body) : "No live messages in Supabase yet. Keep Sample selected, or load the reader.",
      authorName: newestAuthor?.display_name ?? "unknown",
      channel: displayChannelName(newestChannel?.channel_name ?? topicChannel),
      date: shortDate(newest?.ts),
      replies: 0,
    },
    topicLabel: topicChannel,
    topicSummary: newest
      ? snippetOf(newest.body)
      : "Live rows from Supabase will appear here once the community reader has loaded them.",
    topicThreads: tables.coverage.reduce((sum, row) => sum + row.threads_read, 0),
    topicMessages: tables.messages.length,
    topicChannels: tables.channels.length,
    topicUpTo: shortDate(newest?.ts ?? cutoffIso),
    experts,
    whoToTag: experts.slice(0, 2),
    best: {
      name: topicChannel,
      threads: busiest?.threads_read || busiest?.messages_read || tables.messages.length,
      norm: "Live channel with the most recent public messages.",
    },
    postCandidates: postCandidates.length
      ? postCandidates
      : [{ name: topicChannel, workspace: "live", threads: 0, status: "unread" }],
    defaultSelected: [topicChannel],
    crossPostRule: {
      id: rule?.rule_id ?? "live-rule",
      text: rule?.text ?? "Public channels only. Nothing is posted for you.",
      workspace: rule?.workspace ?? "live",
    },
    coverage: coverageRows,
    gap: unread?.channel_name ?? topicChannel,
    libraryThreads,
    sharedLinks: [],
    subtopics: graph.nodes.slice(0, 6).map((node) => ({
      label: node.label,
      thread_count: 1,
    })),
    announce: {
      where: postCandidates.slice(0, 3).map((row) => ({
        ch: row.name,
        why: "Public channel from the live read",
        rule: "live",
      })),
      blocked: [],
      contact: experts.slice(0, 3),
      bestTime: "Live window, last 14 days.",
    },
    myPosts: posts,
    growth: {
      kpis: [
        { label: "Channels read", value: `${readCount} of ${Math.max(tables.channels.length, 0)}`, note: "live" },
        { label: "Messages loaded", value: String(tables.messages.length), note: "" },
        { label: "People", value: String(visiblePeople.length), note: "" },
        { label: "Graph nodes", value: String(graph.nodes.length), note: "Cognee Cloud" },
      ],
      weeks: weeks.length ? weeks : [{ label: shortDate(cutoffIso), n: tables.messages.length }],
    },
    graphNodes,
    graphEdges,
  };
}
