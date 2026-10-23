import type { KnownThread } from "@/lib/sample-data";

function termsOf(question: string): string[] {
  return question
    .toLowerCase()
    .split(/\W+/)
    .filter((term) => term.length > 2);
}

function haystack(thread: KnownThread): string {
  return `${thread.title} ${thread.snippet} ${thread.authorName} ${thread.channel}`.toLowerCase();
}

export function rankMatches(question: string, threads: KnownThread[]): KnownThread[] {
  const terms = termsOf(question);
  if (!terms.length) {
    return [];
  }
  return threads
    .map((thread) => {
      const text = haystack(thread);
      const score = terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0);
      return { thread, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.thread);
}
