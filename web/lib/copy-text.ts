import type { Person } from "@/lib/sample-data";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function taggedPost(draft: string, people: Person[], tagged: string[]): string {
  const tags = people.filter((person) => tagged.includes(person.id)).map((person) => `@${person.name}`);
  return [draft.trim(), tags.join(" ")].filter(Boolean).join("\n\n");
}

export function openUrl(url: string | null | undefined): boolean {
  if (!url || !/^https?:/i.test(url)) {
    return false;
  }
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
