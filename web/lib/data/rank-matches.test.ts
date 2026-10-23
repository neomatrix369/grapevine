import { describe, expect, it } from "vitest";

import { rankMatches } from "./rank-matches";

const THREADS = [
  {
    title: "How do we score RAG retrieval?",
    snippet: "Start with a golden set and recall at 5.",
    authorName: "Cleo Fenwick",
    channel: "evals",
    date: "27 Sep",
    replies: 4,
  },
  {
    title: "Lunch photos from the park",
    snippet: "Nice weather.",
    authorName: "Member",
    channel: "general",
    date: "1 Oct",
    replies: 0,
  },
];

describe("rankMatches", () => {
  it("ranks threads that share terms with the question", () => {
    const ranked = rankMatches("How do people evaluate RAG retrieval quality?", THREADS);
    expect(ranked[0].channel).toBe("evals");
    expect(ranked.some((row) => row.channel === "general")).toBe(false);
  });

  it("returns nothing for an empty question", () => {
    expect(rankMatches("  ", THREADS)).toEqual([]);
  });
});
