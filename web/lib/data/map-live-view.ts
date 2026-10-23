import { sanitizeGraph } from "@/lib/data/graph-filter";
import {
  LIVE_SUGGESTIONS,
  authorLabel,
  channelDisplayName,
  coverageCount,
  coverageUnit,
  initialsOf,
  isBotOrSystem,
  personDisplayName,
  platformLabel,
  shortDate,
  titleOf,
  workspaceLabel,
} from "@/lib/data/display";
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
  url: string | null;
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
  thread_id?: string | null;
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

function isCoverageStatus(value: string): value is CoverageStatus {
  return value === "read" || value === "partial" || value === "unread";
}

function isPostStatus(value: string): value is PostStatus {
  return value === "awaiting" || value === "answered" || value === "replied" || value === "no-reply";
}

function coverageStatus(value: string): CoverageStatus {
  return isCoverageStatus(value) ? value : "unread";
}

function namedChannel(row: LiveChannel): { name: string; workspace: string } {
  return {
    name: channelDisplayName(row.channel_name, row.channel_id),
    workspace: workspaceLabel(row.workspace, row.platform),
  };
}

function toPerson(row: LivePerson, name: string, channels: string[]): Person {
  const answers = row.messages_4w;
  const listed = channels.slice(0, 3).map((item) => `#${item}`).join(", ");
  return {
    id: row.person_id,
    name,
    initials: initialsOf(name),
    answers,
    answersLine: listed ? `${answers} messages in ${listed}` : `${answers} messages`,
    lastActive: shortDate(row.last_active_at),
    active: row.active,
    goto: answers >= 2 ? "active in live channels" : "not enough messages to call go-to",
    roles: [],
  };
}

function expertsFrom(tables: LiveTables, channels: Map<string, LiveChannel>): Person[] {
  const byAuthor = new Map<string, string[]>();
  for (const message of tables.messages) {
    if (!message.author_person_id) {
      continue;
    }
    const channel = channels.get(message.channel_id);
    const name = channel
      ? channelDisplayName(channel.channel_name, channel.channel_id)
      : channelDisplayName(message.channel_id, message.channel_id);
    const current = byAuthor.get(message.author_person_id) ?? [];
    if (!current.includes(name)) {
      current.push(name);
    }
    byAuthor.set(message.author_person_id, current);
  }
  return tables.people
    .filter((person) => !person.hidden && !isBotOrSystem(person))
    .map((row) => {
      const name = personDisplayName(row);
      return name ? toPerson(row, name, byAuthor.get(row.person_id) ?? []) : null;
    })
    .filter((person): person is Person => person !== null)
    .sort((a, b) => b.answers - a.answers)
    .slice(0, 8);
}

function emptyKnown(): SampleView["known"] {
  return { title: "", snippet: "", authorName: "", channel: "", date: "", replies: 0, url: null };
}

export function mapLiveView(
  tables: LiveTables,
  graph: { nodes: GraphNode[]; edges: GraphEdge[] },
): SampleView {
  const channels = new Map(tables.channels.map((row) => [row.channel_id, row]));
  const peopleById = new Map(tables.people.map((row) => [row.person_id, row]));
  const unit = coverageUnit(tables.coverage);
  const experts = expertsFrom(tables, channels);
  const sourceLabel = platformLabel(tables.channels.map((row) => row.platform));
  const coverageRows: CoverageRow[] = tables.coverage.map((row) => {
    const channel = channels.get(row.channel_id);
    return {
      channel_name: channel
        ? channelDisplayName(channel.channel_name, channel.channel_id)
        : channelDisplayName(row.channel_id, row.channel_id),
      workspace: channel ? workspaceLabel(channel.workspace, channel.platform) : workspaceLabel(row.platform, row.platform),
      threads_read: coverageCount(row, unit),
      status: coverageStatus(row.status),
    };
  });
  const postCandidates: ChannelRow[] = tables.channels.map((row) => {
    const cover = tables.coverage.find((item) => item.channel_id === row.channel_id);
    const named = namedChannel(row);
    return {
      name: named.name,
      workspace: named.workspace,
      threads: cover ? coverageCount(cover, unit) : null,
      status: coverageStatus(cover?.status ?? "unread"),
      url: row.url,
      channelId: row.channel_id,
    };
  });
  const busiest = tables.coverage.slice().sort((a, b) => coverageCount(b, unit) - coverageCount(a, unit))[0];
  const bestChannel = busiest ? channels.get(busiest.channel_id) : tables.channels[0];
  const topicChannel = bestChannel ? namedChannel(bestChannel).name : "community";
  const topicCount = tables.coverage.reduce((sum, row) => sum + coverageCount(row, unit), 0) || tables.messages.length;
  const readCount = tables.coverage.filter((row) => row.status === "read" || row.status === "partial").length;
  const unread = coverageRows.find((row) => row.status === "unread");
  const cutoffIso = tables.coverage.find((row) => row.cutoff)?.cutoff ?? tables.messages[0]?.ts ?? null;
  const cleanedGraph = sanitizeGraph(graph.nodes, graph.edges);
  const libraryThreads = tables.messages.slice(0, 8).map((message) => {
    const channel = channels.get(message.channel_id);
    const author = message.author_person_id ? peopleById.get(message.author_person_id) : undefined;
    return {
      title: titleOf(message.body),
      authorName: authorLabel(author),
      channel: channel
        ? channelDisplayName(channel.channel_name, channel.channel_id)
        : channelDisplayName(message.channel_id, message.channel_id),
      date: shortDate(message.ts),
      replies: 0,
      url: message.url,
    };
  });
  const rule = tables.rules[0];
  const posts: MyPost[] = tables.posts.map((post) => ({
    kind: post.kind === "announce" ? "announce" : "question",
    text: post.text,
    channel: post.channel ?? topicChannel,
    workspace: post.workspace ? workspaceLabel(post.workspace, "discord") : sourceLabel,
    at: shortDate(post.at),
    source: post.source === "read" ? "read" : "grapevine",
    tagged: post.tagged ?? [],
    replies: post.replies,
    status: isPostStatus(post.status) ? post.status : "awaiting",
    answeredBy: post.answered_by ?? undefined,
    reactions: post.reactions ?? undefined,
  }));
  const weeks = coverageRows.slice(0, 4).map((row) => ({ label: `#${row.channel_name}`, n: row.threads_read }));

  return {
    source: "live",
    me: { name: "Live" },
    question: "",
    suggestedQuestions: LIVE_SUGGESTIONS,
    announceDraft: "",
    cutoff: shortDate(cutoffIso),
    channelsRead: readCount,
    channelsTotal: Math.max(tables.channels.length, tables.coverage.length),
    sourceLabel,
    known: emptyKnown(),
    topicLabel: topicChannel,
    topicSummary: `${tables.messages.length} public messages in ${tables.channels.length} channels, labelled ${sourceLabel}.`,
    topicThreads: topicCount,
    topicMessages: tables.coverage.reduce((sum, row) => sum + row.messages_read, 0) || tables.messages.length,
    topicUnit: unit,
    topicChannels: tables.channels.length,
    topicUpTo: shortDate(tables.messages[0]?.ts ?? cutoffIso),
    experts,
    whoToTag: experts.slice(0, 2),
    best: {
      name: topicChannel,
      threads: busiest ? coverageCount(busiest, unit) : topicCount,
      norm: "Public channel with the most recent messages.",
    },
    postCandidates: postCandidates.length
      ? postCandidates
      : [{ name: topicChannel, workspace: sourceLabel, threads: 0, status: "unread" }],
    defaultSelected: [topicChannel],
    crossPostRule: {
      id: rule?.rule_id ?? "live-rule",
      text: rule?.text ?? "Public channels only. Nothing is posted for you.",
      workspace: rule ? workspaceLabel(rule.workspace, "discord") : sourceLabel,
    },
    coverage: coverageRows,
    gap: unread?.channel_name ?? topicChannel,
    libraryThreads,
    sharedLinks: [],
    subtopics: cleanedGraph.nodes.slice(0, 6).map((node) => ({
      label: node.fullLabel ?? node.label,
      thread_count: 1,
    })),
    announce: {
      where: postCandidates.slice(0, 3).map((row) => ({
        ch: row.name,
        why: "Public channel from the live read",
        rule: "live",
        url: row.url,
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
        { label: "People", value: String(experts.length), note: "" },
        { label: "Graph nodes", value: String(cleanedGraph.nodes.length), note: "Cognee Cloud" },
      ],
      weeks: weeks.length ? weeks : [{ label: shortDate(cutoffIso), n: tables.messages.length }],
    },
    graphNodes: cleanedGraph.nodes,
    graphEdges: cleanedGraph.edges,
  };
}
