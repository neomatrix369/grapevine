import { describe, expect, it } from "vitest";

import { mapLiveView, type LiveTables } from "./map-live-view";

function tables(overrides: Partial<LiveTables> = {}): LiveTables {
  const base: LiveTables = {
    channels: [
      {
        platform: "discord",
        workspace: "1562206257241128973",
        channel_id: "111",
        channel_name: "general",
        url: "https://discord.com/channels/1562206257241128973/111",
      },
      {
        platform: "discord",
        workspace: "1562206257241128973",
        channel_id: "222",
        channel_name: "team-up",
        url: "https://discord.com/channels/1562206257241128973/222",
      },
      {
        platform: "discord",
        workspace: "1562206257241128973",
        channel_id: "333",
        channel_name: "coupon-codes",
        url: "https://discord.com/channels/1562206257241128973/333",
      },
    ],
    people: [
      {
        person_id: "discord:ada-quill",
        display_name: "Ada Quill",
        hidden: false,
        last_active_at: "2026-10-08T10:00:00Z",
        messages_4w: 12,
        active: true,
      },
      {
        person_id: "discord:unknown",
        display_name: "unknown",
        hidden: false,
        last_active_at: "2026-10-08T11:00:00Z",
        messages_4w: 43,
        active: true,
      },
      {
        person_id: "discord:hook-bot",
        display_name: "GitHub Bot",
        hidden: false,
        last_active_at: "2026-10-08T09:00:00Z",
        messages_4w: 20,
        active: false,
      },
    ],
    messages: [
      {
        body: "Can anyone help with the coupon bot deploy?",
        ts: "2026-10-08T12:00:00Z",
        url: "https://discord.com/channels/1562206257241128973/333/1",
        channel_id: "333",
        author_person_id: "discord:ada-quill",
        platform: "discord",
      },
    ],
    rules: [],
    coverage: [
      {
        platform: "discord",
        channel_id: "111",
        threads_read: 0,
        messages_read: 121,
        status: "read",
        cutoff: "2026-10-08T00:00:00Z",
        newest_read: "2026-10-08T12:00:00Z",
      },
      {
        platform: "discord",
        channel_id: "222",
        threads_read: 0,
        messages_read: 20,
        status: "read",
        cutoff: "2026-10-08T00:00:00Z",
        newest_read: "2026-10-08T12:00:00Z",
      },
      {
        platform: "discord",
        channel_id: "333",
        threads_read: 0,
        messages_read: 15,
        status: "partial",
        cutoff: "2026-10-08T00:00:00Z",
        newest_read: "2026-10-08T12:00:00Z",
      },
    ],
    posts: [],
  };
  return { ...base, ...overrides };
}

describe("mapLiveView", () => {
  it("does not prefill the question from a chat message", () => {
    const view = mapLiveView(tables(), { nodes: [], edges: [] });
    expect(view.question).toBe("");
    expect(view.known.snippet).toBe("");
    expect(view.suggestedQuestions.length).toBeGreaterThanOrEqual(2);
    expect(view.suggestedQuestions.join(" ")).not.toContain("coupon bot deploy");
  });

  it("omits unknown and bot experts and never labels a person unknown", () => {
    const view = mapLiveView(tables(), { nodes: [], edges: [] });
    expect(view.experts.map((person) => person.name)).toEqual(["Ada Quill"]);
    expect(view.experts.some((person) => /unknown/i.test(person.name))).toBe(false);
    expect(view.libraryThreads[0].authorName).toBe("Ada Quill");
  });

  it("uses messages when threads were not stored, so the counts add up", () => {
    const view = mapLiveView(tables(), { nodes: [], edges: [] });
    expect(view.topicUnit).toBe("messages");
    expect(view.best.threads).toBe(121);
    expect(view.topicThreads).toBe(156);
  });

  it("gives each channel chip its own name and hides the guild snowflake", () => {
    const view = mapLiveView(tables(), { nodes: [], edges: [] });
    expect(view.postCandidates.map((row) => row.name)).toEqual(["general", "team-up", "coupon-codes"]);
    expect(view.postCandidates.every((row) => row.workspace === "Discord")).toBe(true);
    expect(view.postCandidates[0].url).toContain("/111");
    expect(view.postCandidates[1].url).toContain("/222");
  });

  it("labels the source Discord when only Discord rows exist", () => {
    const view = mapLiveView(tables(), { nodes: [], edges: [] });
    expect(view.sourceLabel).toBe("Discord");
  });
});
