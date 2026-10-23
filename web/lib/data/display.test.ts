import { describe, expect, it } from "vitest";

import {
  authorLabel,
  channelDisplayName,
  coverageCount,
  coverageUnit,
  isBotOrSystem,
  personDisplayName,
  platformLabel,
  shortDate,
  workspaceLabel,
} from "./display";

describe("personDisplayName", () => {
  it("uses display_name when it is a real name", () => {
    expect(personDisplayName({ person_id: "discord:ada", display_name: "Ada Quill" })).toBe("Ada Quill");
  });

  it("never returns unknown and falls back to the handle in the person id", () => {
    expect(personDisplayName({ person_id: "discord:cleo-fenwick", display_name: "unknown" })).toBe(
      "cleo fenwick",
    );
  });

  it("returns empty when both name and handle are unknown", () => {
    expect(personDisplayName({ person_id: "discord:unknown", display_name: "unknown" })).toBe("");
    expect(authorLabel({ person_id: "discord:unknown", display_name: "unknown" })).toBe("Member");
  });
});

describe("isBotOrSystem", () => {
  it("excludes bots, missing people and unknown labels", () => {
    expect(isBotOrSystem(undefined)).toBe(true);
    expect(isBotOrSystem({ person_id: "discord:hook", display_name: "GitHub Bot" })).toBe(true);
    expect(isBotOrSystem({ person_id: "discord:unknown", display_name: "unknown" })).toBe(true);
    expect(isBotOrSystem({ person_id: "discord:ada", display_name: "Ada Quill" })).toBe(false);
  });
});

describe("channel and source labels", () => {
  it("shows the channel name, not a snowflake id", () => {
    expect(channelDisplayName("general", "1562206257241128973")).toBe("general");
    expect(channelDisplayName("unread, team-up (2)", "99")).toBe("team-up");
  });

  it("hides a guild snowflake behind the platform name", () => {
    expect(workspaceLabel("1562206257241128973", "discord")).toBe("Discord");
    expect(workspaceLabel("Example Makers", "slack")).toBe("Example Makers");
  });

  it("labels the source from distinct platforms only", () => {
    expect(platformLabel(["discord"])).toBe("Discord");
    expect(platformLabel(["discord", "discord"])).toBe("Discord");
    expect(platformLabel(["slack", "discord"])).toBe("Slack + Discord");
  });
});

describe("coverage counts", () => {
  it("uses messages when threads were not stored", () => {
    const rows = [
      { threads_read: 0, messages_read: 121 },
      { threads_read: 0, messages_read: 35 },
    ];
    expect(coverageUnit(rows)).toBe("messages");
    expect(coverageCount(rows[0], "messages")).toBe(121);
  });
});

describe("shortDate", () => {
  it("does not say unknown", () => {
    expect(shortDate(null)).toBe("date not stated");
    expect(shortDate("not-a-date")).toBe("date not stated");
  });
});
