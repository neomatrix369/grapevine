"use client";

import { useMemo, useState } from "react";

import { AnnounceResults } from "@/components/announce-results";
import { AskResults } from "@/components/ask-results";
import { ComposeBox } from "@/components/compose-box";
import { CloseIcon, ComposeIcon, ExpertsIcon, GrowthIcon, LibraryIcon, PostsIcon } from "@/components/icons";
import { InPlaceBody } from "@/components/inplace-panels";
import type { DataSource } from "@/lib/data/types";
import { awaitingCount, type Mode, type Panel, type SampleView } from "@/lib/sample-data";
import { useAsk } from "@/lib/use-ask";

const NAV: { id: Panel; label: string; icon: typeof ComposeIcon }[] = [
  { id: "compose", label: "Compose", icon: ComposeIcon },
  { id: "library", label: "Library", icon: LibraryIcon },
  { id: "experts", label: "Experts", icon: ExpertsIcon },
  { id: "posts", label: "My posts", icon: PostsIcon },
  { id: "growth", label: "Growth", icon: GrowthIcon },
];

type WorkspaceAppProps = {
  view: SampleView;
  source: DataSource;
  onToast: (message: string) => void;
  cueQuestion?: string;
  cueAsked?: boolean;
  cuePanel?: Panel | null;
  cueMode?: Mode;
};

export function WorkspaceApp({
  view,
  source,
  onToast,
  cueQuestion,
  cueAsked,
  cuePanel,
  cueMode,
}: WorkspaceAppProps) {
  const [mode, setMode] = useState<Mode>(cueMode ?? "ask");
  const [panel, setPanel] = useState<Panel>(cuePanel ?? "compose");
  const [selected, setSelected] = useState<string[]>(view.defaultSelected);
  const [tagged, setTagged] = useState<string[]>(view.whoToTag.map((person) => person.id));
  const ask = useAsk(source, view, cueQuestion, cueAsked);
  const awaiting = useMemo(() => awaitingCount(view.myPosts), [view.myPosts]);
  const shownPanel = cuePanel !== undefined ? (cuePanel ?? "compose") : panel;
  const shownMode = cueMode ?? mode;
  const hasPanel = shownPanel !== "compose";

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
    ask.setDraft(next === "announce" ? view.announceDraft : ask.draft);
  }

  return (
    <div className={hasPanel ? "has-panel" : undefined} id="view-workspace" role="tabpanel" aria-labelledby="tab-workspace">
      <div className="shell">
        <nav className="side" aria-label="Workspace">
          {NAV.map((item) => {
            const Icon = item.icon;
            const current = shownPanel === item.id;
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
            <h1>{shownMode === "announce" ? "Announce once, to the right places" : "Ask anything about our communities"}</h1>
            <span className="seg" role="group" aria-label="Mode">
              <button type="button" aria-pressed={shownMode === "ask"} onClick={() => switchMode("ask")}>
                Ask
              </button>
              <button type="button" aria-pressed={shownMode === "announce"} onClick={() => switchMode("announce")}>
                Announce
              </button>
            </span>
          </div>
          <ComposeBox
            id="q"
            label={shownMode === "announce" ? "Your announcement" : "Your question"}
            draft={ask.draft}
            rows={shownMode === "announce" ? 3 : 2}
            placeholder={
              shownMode === "announce"
                ? "Paste your event or hackathon announcement"
                : "Type your question once. Grapevine shows what is known, who knows it and where to post."
            }
            suggestions={shownMode === "ask" ? view.suggestedQuestions : []}
            asking={ask.asking}
            asked={ask.asked}
            askLabel={shownMode === "announce" ? "Preview" : "Ask"}
            onChange={ask.setDraft}
            onAsk={(question) => void ask.ask(question)}
          />
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
          {shownMode === "announce" ? (
            <AnnounceResults view={view} draft={ask.draft} onToast={onToast} />
          ) : (
            <AskResults
              view={view}
              draft={ask.draft}
              selected={selected}
              tagged={tagged}
              matches={ask.matches}
              asked={ask.asked}
              asking={ask.asking}
              askMessage={ask.askMessage}
              onToggleChannel={toggleChannel}
              onToggleTag={toggleTag}
              onOpenPanel={setPanel}
              onToast={onToast}
            />
          )}
        </main>
        {hasPanel ? (
          <aside className="inplace" aria-labelledby="ip-h">
            <div className="dh">
              <h2 id="ip-h" tabIndex={-1}>
                {shownPanel === "posts" ? "My posts" : shownPanel === "library" ? "Library" : shownPanel === "experts" ? "Experts" : "Growth"}
              </h2>
              <button className="x" type="button" aria-label="Close" onClick={() => setPanel("compose")}>
                <CloseIcon />
              </button>
            </div>
            <div className="tp">
              <InPlaceBody panel={shownPanel} view={view} onToast={onToast} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
