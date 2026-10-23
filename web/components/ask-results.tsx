"use client";

import { Button } from "@/components/ui/button";
import { WarnIcon } from "@/components/icons";
import { copyText, openUrl, taggedPost } from "@/lib/copy-text";
import type { KnownThread, Person, SampleView } from "@/lib/sample-data";

type AskResultsProps = {
  view: SampleView;
  draft: string;
  selected: string[];
  tagged: string[];
  matches: KnownThread[];
  asked: boolean;
  asking: boolean;
  askMessage: string | null;
  onToggleChannel: (name: string) => void;
  onToggleTag: (id: string) => void;
  onOpenPanel: (panel: "library" | "experts") => void;
  onToast: (message: string) => void;
};

function Avatar({ person }: { person: Person }) {
  return (
    <span className="av" aria-hidden="true">
      {person.initials}
    </span>
  );
}

function KnownBlock({
  view,
  matches,
  asked,
  asking,
  askMessage,
  onOpenPanel,
  onToast,
}: Pick<AskResultsProps, "view" | "matches" | "asked" | "asking" | "askMessage" | "onOpenPanel" | "onToast">) {
  if (asking) {
    return <p className="src">Searching the library…</p>;
  }
  if (!asked) {
    return <p className="src">Press Ask to rank matching messages for this question.</p>;
  }
  if (askMessage && !matches.length) {
    return <p className="src">{askMessage}</p>;
  }
  const rows = matches.length ? matches : [];
  return (
    <div>
      {rows.map((known, index) => (
        <div key={`${known.channel}-${known.date}-${index}`} className="known-hit">
          <div>&ldquo;{known.title}&rdquo;</div>
          <div className="src">
            <span className="snip">{known.snippet}</span>
          </div>
          <div className="src">
            {known.authorName} · #{known.channel} · {known.date}
            {known.replies ? ` · ${known.replies} replies` : ""}
            {" · "}
            <button
              className="more"
              type="button"
              onClick={() => {
                if (!openUrl(known.url)) {
                  onToast("No live thread link for this message.");
                }
              }}
            >
              Open thread
            </button>
          </div>
        </div>
      ))}
      <div className="src">
        <button className="more" type="button" onClick={() => onOpenPanel("library")}>
          Topic note: {view.topicLabel}
        </button>
      </div>
    </div>
  );
}

export function AskResults({
  view,
  draft,
  selected,
  tagged,
  matches,
  asked,
  asking,
  askMessage,
  onToggleChannel,
  onToggleTag,
  onOpenPanel,
  onToast,
}: AskResultsProps) {
  const top = view.whoToTag.slice(0, 2);
  const sameCommunity = selected.filter((name) =>
    view.postCandidates.some((candidate) => candidate.name === name && candidate.workspace === view.crossPostRule.workspace),
  );
  const showCrossPost = sameCommunity.length > 1;
  const unit = view.topicUnit;
  const openName = selected[0] ?? view.best.name;
  const openRow = view.postCandidates.find((row) => row.name === openName);

  return (
    <section className="panel results" aria-live="polite" aria-label="Results">
      <div className="rrow">
        <div className="rh">
          <span className="label">Already known</span>
          <span className="src">from the Library</span>
        </div>
        <KnownBlock
          view={view}
          matches={matches}
          asked={asked}
          asking={asking}
          askMessage={askMessage}
          onOpenPanel={onOpenPanel}
          onToast={onToast}
        />
      </div>

      <div className="rrow">
        <div className="rh">
          <span className="label">Experts to tag</span>
          <span className="src">optional, you choose</span>
        </div>
        <div className="people">
          {top.length ? (
            top.map((person) => (
              <label className="person" key={person.id}>
                <Avatar person={person} />
                <span>
                  <b style={{ fontWeight: 500 }}>{person.name}</b>
                  {person.active ? <span className="tag ink"> Active</span> : null}
                  <span className="src" style={{ display: "block" }}>
                    Proof: {person.answersLine} · last active {person.lastActive}
                  </span>
                </span>
                <span className="cb">
                  <input
                    type="checkbox"
                    checked={tagged.includes(person.id)}
                    onChange={() => onToggleTag(person.id)}
                  />{" "}
                  Tag
                </span>
              </label>
            ))
          ) : (
            <p className="src">Nobody named on this topic yet.</p>
          )}
          <div>
            <button className="more" type="button" onClick={() => onOpenPanel("experts")}>
              All {view.experts.length} experts on {view.topicLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="rrow">
        <div className="rh">
          <span className="label">Where to post</span>
          <span className="src">with the rule that applies</span>
        </div>
        <div>
          <div className="src" style={{ margin: "0 0 8px" }}>
            <span className="ch">#{view.best.name}</span> is best: {view.best.threads} of {view.topicThreads} {unit} on
            this topic. Norm: &ldquo;{view.best.norm}&rdquo;
          </div>
          <fieldset style={{ border: 0 }}>
            <legend className="sr-only">Post in</legend>
            <div className="postin">
              {view.postCandidates.map((channel) => (
                <label className="cb" key={channel.channelId ?? channel.name} title={channel.channelId ?? undefined}>
                  <input
                    type="checkbox"
                    checked={selected.includes(channel.name)}
                    onChange={() => onToggleChannel(channel.name)}
                  />
                  <span className="ch">#{channel.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="check" aria-live="polite">
            {showCrossPost ? (
              <div className="check-line">
                <WarnIcon />
                <span>
                  <b>Cross-post flagged.</b> {sameCommunity.length} channels in {view.crossPostRule.workspace}:
                  &ldquo;{view.crossPostRule.text.split(". ")[0]}.&rdquo; Rule {view.crossPostRule.id}. Untick{" "}
                  {sameCommunity.length - 1}, or keep it: you decide.
                </span>
              </div>
            ) : null}
          </div>
          <div className="acts">
            <Button
              size="sm"
              onClick={async () => {
                const text = taggedPost(draft, view.experts, tagged);
                const ok = await copyText(text);
                onToast(
                  ok
                    ? `Copied${tagged.length ? ` with ${tagged.length} tag${tagged.length === 1 ? "" : "s"}` : ""}. Nothing was posted.`
                    : "Could not copy.",
                );
              }}
            >
              Copy{tagged.length ? ` with ${tagged.length} tag${tagged.length === 1 ? "" : "s"}` : ""}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!openUrl(openRow?.url ?? null)) {
                  onToast(`No live link for #${openName}`);
                }
              }}
            >
              Open #{openName}
            </Button>
            <span className="src" style={{ margin: 0 }}>
              Nothing is posted for you. You paste and send it yourself.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
