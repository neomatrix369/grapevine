import type { CountUnit } from "@/lib/sample-data";

export type { CountUnit };

const UNKNOWN = /^(unknown|untitled|deleted user|deleted-user)$/i;
const BOT = /\b(bot|webhook|system)\b/i;
const SNOWFLAKE = /^\d{16,}$/;

export const LIVE_SUGGESTIONS = [
  "Who can help with Supabase vector search?",
  "Where should I post a project update?",
  "Who knows Discord bots or Cognee?",
];

export function isSnowflake(value: string): boolean {
  return SNOWFLAKE.test(value.trim());
}

export function isUnknownLabel(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 || UNKNOWN.test(trimmed);
}

export function handleFromPersonId(personId: string): string {
  return personId.replace(/^(slack|discord):/i, "").replace(/-/g, " ").trim();
}

export function personDisplayName(person: { display_name: string; person_id: string } | undefined): string {
  if (!person) {
    return "";
  }
  const name = person.display_name.trim();
  if (!isUnknownLabel(name) && !BOT.test(name) && !isSnowflake(name)) {
    return name;
  }
  const handle = handleFromPersonId(person.person_id);
  if (!isUnknownLabel(handle) && !BOT.test(handle) && !isSnowflake(handle)) {
    return handle;
  }
  return "";
}

export function authorLabel(person: { display_name: string; person_id: string } | undefined): string {
  return personDisplayName(person) || "Member";
}

export function isBotOrSystem(person: { display_name: string; person_id: string } | undefined): boolean {
  if (!person) {
    return true;
  }
  if (BOT.test(person.display_name) || BOT.test(person.person_id)) {
    return true;
  }
  return personDisplayName(person).length === 0;
}

export function channelDisplayName(name: string, channelId: string): string {
  const cleaned = name.replace(/^unread,\s*/i, "").replace(/\s*\([^)]*\)\s*$/g, "").trim();
  if (cleaned && !isSnowflake(cleaned)) {
    return cleaned;
  }
  if (name && !isSnowflake(name)) {
    return name;
  }
  if (channelId && !isSnowflake(channelId)) {
    return channelId;
  }
  return cleaned || name || channelId;
}

export function platformTitle(platform: string): string {
  const key = platform.toLowerCase();
  if (key === "discord") {
    return "Discord";
  }
  if (key === "slack") {
    return "Slack";
  }
  return platform;
}

export function workspaceLabel(workspace: string, platform: string): string {
  if (!workspace || isSnowflake(workspace) || isUnknownLabel(workspace)) {
    return platformTitle(platform);
  }
  return workspace;
}

export function platformLabel(platforms: Iterable<string>): string {
  const set = new Set(
    [...platforms].map((item) => item.toLowerCase()).filter((item) => item === "slack" || item === "discord"),
  );
  if (set.has("slack") && set.has("discord")) {
    return "Slack + Discord";
  }
  if (set.has("slack")) {
    return "Slack";
  }
  if (set.has("discord")) {
    return "Discord";
  }
  return "Live";
}

export function coverageUnit(rows: { threads_read: number; messages_read: number }[]): CountUnit {
  return rows.some((row) => row.threads_read > 0) ? "threads" : "messages";
}

export function coverageCount(
  row: { threads_read: number; messages_read: number },
  unit: CountUnit,
): number {
  return unit === "threads" ? row.threads_read : row.messages_read;
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) {
    return "date not stated";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "date not stated";
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function snippetOf(body: string | null | undefined): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  if (!text) {
    return "No message text.";
  }
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

export function titleOf(body: string | null | undefined): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  if (!text) {
    return "Untitled message";
  }
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}
