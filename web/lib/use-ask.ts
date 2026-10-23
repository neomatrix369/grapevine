"use client";

import { useState } from "react";

import { rankMatches } from "@/lib/data/rank-matches";
import type { AskResponse, DataSource } from "@/lib/data/types";
import type { KnownThread, SampleView } from "@/lib/sample-data";

function sampleCorpus(view: SampleView): KnownThread[] {
  return [
    view.known,
    ...view.libraryThreads.map((thread) => ({
      title: thread.title,
      snippet: thread.title,
      authorName: thread.authorName,
      channel: thread.channel,
      date: thread.date,
      replies: thread.replies,
      url: thread.url,
    })),
  ].filter((thread) => thread.title.length > 0);
}

export function useAsk(source: DataSource, view: SampleView, cueQuestion?: string, cueAsked?: boolean) {
  const [typed, setTyped] = useState("");
  const [asked, setAsked] = useState(false);
  const [asking, setAsking] = useState(false);
  const [matches, setMatches] = useState<KnownThread[]>([]);
  const [askMessage, setAskMessage] = useState<string | null>(null);
  const draft = cueQuestion ?? typed;
  const cueMatches = cueAsked && cueQuestion ? rankMatches(cueQuestion, sampleCorpus(view)) : null;

  async function runAsk(question = draft) {
    const trimmed = question.trim();
    if (!trimmed) {
      setAskMessage("Type a question, or pick a suggestion.");
      return;
    }
    setTyped(trimmed);
    setAsking(true);
    setAsked(true);
    if (source === "sample") {
      const ranked = rankMatches(trimmed, sampleCorpus(view));
      setMatches(ranked);
      setAskMessage(ranked.length ? null : "No matching messages for this question.");
      setAsking(false);
      return;
    }
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!response.ok) {
        throw new Error("ask-http");
      }
      const payload = (await response.json()) as AskResponse;
      setMatches(payload.matches ?? []);
      setAskMessage(payload.status === "ok" ? null : payload.message);
    } catch {
      setMatches([]);
      setAskMessage("Search is unreachable. Live source is still selected.");
    }
    setAsking(false);
  }

  return {
    draft,
    setDraft: setTyped,
    asked: asked || Boolean(cueAsked),
    asking,
    matches: cueMatches ?? matches,
    askMessage: cueMatches && cueMatches.length === 0 ? "No matching messages for this question." : askMessage,
    ask: runAsk,
  };
}
