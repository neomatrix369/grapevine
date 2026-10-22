/**
 * Typed fictional sample for Step 1. Names and threads are made up.
 * Mirrors mockup/mock-data.js enough to fill the one-screen shell.
 */

export type Mode = "ask" | "announce";
export type Panel = "compose" | "library" | "experts" | "posts" | "growth";
export type CoverageStatus = "read" | "partial" | "unread";
export type PostStatus = "awaiting" | "answered" | "replied" | "no-reply";

export type Person = {
  id: string;
  name: string;
  initials: string;
  answers: number;
  answersLine: string;
  lastActive: string;
  active: boolean;
  goto: string;
  roles: string[];
};

export type ChannelRow = {
  name: string;
  workspace: string;
  threads: number | null;
  status: CoverageStatus;
};

export type CoverageRow = {
  channel_name: string;
  workspace: string;
  threads_read: number;
  status: CoverageStatus;
};

export type KnownThread = {
  title: string;
  snippet: string;
  authorName: string;
  channel: string;
  date: string;
  replies: number;
};

export type MyPost = {
  kind: "question" | "announce";
  text: string;
  channel: string;
  workspace: string;
  at: string;
  source: "grapevine" | "read";
  tagged: string[];
  replies: number;
  status: PostStatus;
  answeredBy?: string;
  reactions?: number;
};

export type SampleView = {
  me: { name: string };
  question: string;
  announceDraft: string;
  cutoff: string;
  channelsRead: number;
  channelsTotal: number;
  known: KnownThread;
  topicLabel: string;
  topicSummary: string;
  topicThreads: number;
  topicMessages: number;
  topicChannels: number;
  topicUpTo: string;
  experts: Person[];
  whoToTag: Person[];
  best: { name: string; threads: number; norm: string };
  postCandidates: ChannelRow[];
  defaultSelected: string[];
  crossPostRule: { id: string; text: string; workspace: string };
  coverage: CoverageRow[];
  gap: string;
  libraryThreads: { title: string; authorName: string; channel: string; date: string; replies: number }[];
  sharedLinks: { label: string; times: number; first: string; replies: number }[];
  subtopics: { label: string; thread_count: number }[];
  announce: {
    where: { ch: string; why: string; rule: string }[];
    blocked: { ch: string; quote: string; rule: string; workspace: string }[];
    contact: Person[];
    bestTime: string;
  };
  myPosts: MyPost[];
  growth: {
    kpis: { label: string; value: string; note: string }[];
    weeks: { label: string; n: number }[];
  };
};

const cleo: Person = {
  id: "p-cleo",
  name: "Cleo Fenwick",
  initials: "CF",
  answers: 8,
  answersLine: "8 answers in #evals, #show-and-tell",
  lastActive: "today",
  active: false,
  goto: "go-to for RAG evaluation",
  roles: [],
};

const ada: Person = {
  id: "p-ada",
  name: "Ada Quill",
  initials: "AQ",
  answers: 5,
  answersLine: "5 answers in #evals, #ask-anything",
  lastActive: "3 days ago",
  active: false,
  goto: "go-to for RAG evaluation",
  roles: [],
};

const kemi: Person = {
  id: "p-kemi",
  name: "Kemi Hart",
  initials: "KH",
  answers: 5,
  answersLine: "5 answers in #evals, #events",
  lastActive: "1 day ago",
  active: true,
  goto: "go-to for RAG evaluation",
  roles: [],
};

const jonah: Person = {
  id: "p-jonah",
  name: "Jonah Pike",
  initials: "JP",
  answers: 2,
  answersLine: "2 answers in #ask-anything, #help-rag",
  lastActive: "2 days ago",
  active: false,
  goto: "go-to for RAG evaluation",
  roles: ["moderator"],
};

const gita: Person = {
  id: "p-gita",
  name: "Gita Rao",
  initials: "GR",
  answers: 1,
  answersLine: "1 answer in #show-and-tell",
  lastActive: "today",
  active: false,
  goto: "1 answer, not enough to call go-to",
  roles: ["organiser"],
};

export const SAMPLE: SampleView = {
  me: { name: "Robin Vale" },
  question: "How do people evaluate RAG retrieval quality before shipping?",
  announceDraft:
    "RAG evals workshop, Thu 19 Nov, 18:30, near Old Street. Hands-on: build a golden set from your own tickets, then test an LLM judge against it. Looking for one more speaker.",
  cutoff: "24 Sep",
  channelsRead: 5,
  channelsTotal: 7,
  known: {
    title: "How are folks measuring retrieval quality before shipping a RAG feature?",
    snippet:
      "Build a golden set first: 50 real questions with the chunks that should come back. Then track recall@5 and MRR.",
    authorName: "Cleo Fenwick",
    channel: "evals",
    date: "27 Sep",
    replies: 4,
  },
  topicLabel: "RAG evaluation",
  topicSummary:
    "Members start with a golden set of about 50 real questions and track recall@5 before any LLM judge. Judges are calibrated against hand labels and re-checked when the prompt changes.",
  topicThreads: 20,
  topicMessages: 55,
  topicChannels: 5,
  topicUpTo: "19 Oct",
  experts: [cleo, kemi, ada, jonah],
  whoToTag: [cleo, ada],
  best: {
    name: "evals",
    threads: 9,
    norm: "Share numbers with the dataset you used.",
  },
  postCandidates: [
    { name: "evals", workspace: "Example Makers", threads: 9, status: "read" },
    { name: "show-and-tell", workspace: "Example Makers", threads: 3, status: "partial" },
    { name: "ask-anything", workspace: "Example Agents Guild", threads: 4, status: "read" },
  ],
  defaultSelected: ["evals", "show-and-tell"],
  crossPostRule: {
    id: "d-r3",
    text: "Post each question in one channel only. Cross-posting the same message to several channels will be removed.",
    workspace: "Example Makers",
  },
  coverage: [
    { channel_name: "help-rag", workspace: "Example Makers", threads_read: 12, status: "read" },
    { channel_name: "evals", workspace: "Example Makers", threads_read: 9, status: "read" },
    { channel_name: "show-and-tell", workspace: "Example Makers", threads_read: 8, status: "partial" },
    { channel_name: "ask-anything", workspace: "Example Agents Guild", threads_read: 12, status: "read" },
    { channel_name: "mcp-servers", workspace: "Example Agents Guild", threads_read: 10, status: "read" },
    { channel_name: "retrieval-lab", workspace: "Example Agents Guild", threads_read: 0, status: "unread" },
    { channel_name: "events", workspace: "Example Makers", threads_read: 4, status: "read" },
  ],
  gap: "retrieval-lab",
  libraryThreads: [
    {
      title: "How are folks measuring retrieval quality before shipping a RAG feature?",
      authorName: "Dev Marlowe",
      channel: "evals",
      date: "27 Sep",
      replies: 4,
    },
    {
      title: "Sharing our eval checklist: golden set, recall@k, faithfulness.",
      authorName: "Cleo Fenwick",
      channel: "evals",
      date: "1 Oct",
      replies: 2,
    },
    {
      title: "Is LLM-as-judge reliable enough to trust?",
      authorName: "Hugo Lind",
      channel: "evals",
      date: "2 Oct",
      replies: 2,
    },
  ],
  sharedLinks: [
    { label: "example.com/fake-cheatsheet", times: 3, first: "Iris Achebe", replies: 3 },
    { label: "example.com/fake-eval-checklist", times: 1, first: "Cleo Fenwick", replies: 2 },
    { label: "example.com/fake-evals-ci", times: 1, first: "Kemi Hart", replies: 2 },
  ],
  subtopics: [
    { label: "Golden sets", thread_count: 5 },
    { label: "LLM-as-judge", thread_count: 1 },
    { label: "Retrieval metrics", thread_count: 3 },
  ],
  announce: {
    where: [
      { ch: "events", why: "Channel topic allows event announcements", rule: "d-c104" },
      { ch: "show-and-tell", why: "Self-promo welcome, one post per project per week", rule: "d-c103" },
    ],
    blocked: [
      {
        ch: "help-rag",
        quote: "No promotion, job posts or event announcements here. Events go in #events.",
        rule: "d-c101b",
        workspace: "Example Makers",
      },
    ],
    contact: [jonah, gita, cleo],
    bestTime: "17:00 to 20:00 London (27 of 88 messages).",
  },
  myPosts: [
    {
      kind: "question",
      text: "How do people evaluate RAG retrieval quality before shipping?",
      channel: "evals",
      workspace: "Example Makers",
      at: "22 Oct",
      source: "grapevine",
      tagged: ["Cleo Fenwick"],
      replies: 0,
      status: "awaiting",
    },
    {
      kind: "announce",
      text: "RAG evals workshop, Thu 19 Nov, 18:30, near Old Street.",
      channel: "events",
      workspace: "Example Makers",
      at: "20 Oct",
      source: "grapevine",
      tagged: [],
      replies: 3,
      reactions: 11,
      status: "replied",
    },
    {
      kind: "question",
      text: "Which pgvector index do you use for under 1M rows?",
      channel: "ask-anything",
      workspace: "Example Agents Guild",
      at: "9 Oct",
      source: "read",
      tagged: [],
      replies: 4,
      answeredBy: "Dev Marlowe",
      status: "answered",
    },
    {
      kind: "question",
      text: "Anyone versioning MCP tool schemas in CI?",
      channel: "mcp-servers",
      workspace: "Example Agents Guild",
      at: "1 Oct",
      source: "read",
      tagged: [],
      replies: 0,
      status: "no-reply",
    },
  ],
  growth: {
    kpis: [
      { label: "Channels read", value: "5 of 7", note: "" },
      { label: "Threads read", value: "55", note: "" },
      { label: "Experts on topic", value: "4", note: "" },
      { label: "Topics", value: "12", note: "with notes and sources" },
    ],
    weeks: [
      { label: "24 Sep", n: 12 },
      { label: "1 Oct", n: 28 },
      { label: "8 Oct", n: 41 },
      { label: "15 Oct", n: 55 },
    ],
  },
};

export function awaitingCount(posts: MyPost[]): number {
  return posts.filter((p) => p.status === "awaiting").length;
}

export function coverageLabel(row: CoverageRow): string {
  switch (row.status) {
    case "unread":
      return "Not read yet";
    case "partial":
      return `Partly read · ${row.threads_read} threads`;
    case "read":
      return `${row.threads_read} threads`;
    default: {
      const _exhaustive: never = row.status;
      return _exhaustive;
    }
  }
}

export function postStatusLabel(status: PostStatus): string {
  switch (status) {
    case "awaiting":
      return "Awaiting replies";
    case "answered":
      return "Answered";
    case "replied":
      return "Replies";
    case "no-reply":
      return "No reply in 7 days";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
