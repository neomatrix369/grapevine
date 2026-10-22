"use client";

import { useMemo, useState } from "react";

import { AnnounceResults } from "@/components/announce-results";
import { AskResults } from "@/components/ask-results";
import { CloseIcon, ComposeIcon, ExpertsIcon, GrowthIcon, LibraryIcon, PostsIcon } from "@/components/icons";
import { InPlaceBody } from "@/components/inplace-panels";
import { awaitingCount, type Mode, type Panel, type SampleView } from "@/lib/sample-data";

const NAV: { id: Panel; label: string; icon: typeof ComposeIcon }[] = [
  { id: "compose", label: "Compose", icon: ComposeIcon },
  { id: "library", label: "Library", icon: LibraryIcon },
  { id: "experts", label: "Experts", icon: ExpertsIcon },
  { id: "posts", label: "My posts", icon: PostsIcon },
  { id: "growth", label: "Growth", icon: GrowthIcon },
];

type WorkspaceAppProps = {
  view: SampleView;
};

export function WorkspaceApp({ view }: WorkspaceAppProps) {
  const [mode, setMode] = useState<Mode>("ask");
  const [panel, setPanel] = useState<Panel>("compose");
  const [draft, setDraft] = useState(view.question);
  const [selected, setSelected] = useState<string[]>(view.defaultSelected);
  const [tagged, setTagged] = useState<string[]>(view.whoToTag.map((person) => person.id));
  const awaiting = useMemo(() => awaitingCount(view.myPosts), [view.myPosts]);
  const hasPanel = panel !== "compose";

  function toggleChannel(name: string) {
    setSelected((current) => {
      const next = current.includes(name) ? current.filter((item) => item !== name) : [...current, name];
      return next.length ? next : [view.best.name];
    });
  }

  function toggleTag(id: string) {
    setTagged((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function switchMode(next: Mode) {
    setMode(next);
    setDraft(next === "announce" ? view.announceDraft : view.question);
  }

  return (
    <div className={hasPanel ? "has-panel" : undefined} id="view-workspace" role="tabpanel" aria-labelledby="tab-workspace">
      <div className="shell">
        <nav className="side" aria-label="Workspace">
          {NAV.map((item) => {
            const Icon = item.icon;
            const current = panel === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={current ? "page" : undefined}
                onClick={() => setPanel(item.id)}
              >
                <Icon />
                <span>{item.label}</span>
                {item.id === "posts" ? <span className="count">{awaiting}</span> : null}
              </button>
            );
          })}
        </nav>
        <main>
          <div className="titlebar">
            <h1>{mode === "announce" ? "Announce once, to the right places" : "Ask anything about our communities"}</h1>
            <span className="seg" role="group" aria-label="Mode">
              <button type="button" aria-pressed={mode === "ask"} onClick={() => switchMode("ask")}>
                Ask
              </button>
              <button type="button" aria-pressed={mode === "announce"} onClick={() => switchMode("announce")}>
                Announce
              </button>
            </span>
          </div>
          <div className="compose">
            <label htmlFor="q" className="sr-only">
              {mode === "announce" ? "Your announcement" : "Your question"}
            </label>
            <textarea
              id="q"
              rows={mode === "announce" ? 3 : 2}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                mode === "announce"
                  ? "Paste your event or hackathon announcement"
                  : "Type your question once. Grapevine shows what is known, who knows it and where to post."
              }
            />
          </div>
          <p className="confid">
            <span>
              Based on{" "}
              <b>
                {view.channelsRead} of {view.channelsTotal}
              </b>{" "}
              channels, since {view.cutoff}.
            </span>
            <button className="more" type="button" onClick={() => setPanel("growth")}>
              Coverage
            </button>
          </p>
          {mode === "announce" ? (
            <AnnounceResults view={view} />
          ) : (
            <AskResults
              view={view}
              selected={selected}
              tagged={tagged}
              onToggleChannel={toggleChannel}
              onToggleTag={toggleTag}
              onOpenPanel={setPanel}
            />
          )}
        </main>
        {hasPanel ? (
          <aside className="inplace" aria-labelledby="ip-h">
            <div className="dh">
              <h2 id="ip-h" tabIndex={-1}>
                {panel === "posts" ? "My posts" : panel === "library" ? "Library" : panel === "experts" ? "Experts" : "Growth"}
              </h2>
              <button className="x" type="button" aria-label="Close" onClick={() => setPanel("compose")}>
                <CloseIcon />
              </button>
            </div>
            <div className="tp">
              <InPlaceBody panel={panel} view={view} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
