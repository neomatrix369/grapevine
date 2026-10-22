"use client";

import { Button } from "@/components/ui/button";
import { WarnIcon } from "@/components/icons";
import type { Person, SampleView } from "@/lib/sample-data";

type AskResultsProps = {
  view: SampleView;
  selected: string[];
  tagged: string[];
  onToggleChannel: (name: string) => void;
  onToggleTag: (id: string) => void;
  onOpenPanel: (panel: "library" | "experts") => void;
};

function Avatar({ person }: { person: Person }) {
  return (
    <span className="av" aria-hidden="true">
      {person.initials}
    </span>
  );
}

export function AskResults({
  view,
  selected,
  tagged,
  onToggleChannel,
  onToggleTag,
  onOpenPanel,
}: AskResultsProps) {
  const known = view.known;
  const top = view.whoToTag.slice(0, 2);
  const sameCommunity = selected.filter((name) =>
    view.postCandidates.some((c) => c.name === name && c.workspace === view.crossPostRule.workspace),
  );
  const showCrossPost = sameCommunity.length > 1;

  return (
    <section className="panel results" aria-live="polite" aria-label="Results">
      <div className="rrow">
        <div className="rh">
          <span className="label">Already known</span>
          <span className="src">from the Library</span>
        </div>
        <div>
          <div>&ldquo;{known.title}&rdquo;</div>
          <div className="src">
            <span className="snip">{known.snippet}</span>
          </div>
          <div className="src">
            {known.authorName} · #{known.channel} · {known.date} · {known.replies} replies ·{" "}
            <a href="#thread">Open thread</a>
          </div>
          <div className="src">
            <button className="more" type="button" onClick={() => onOpenPanel("library")}>
              Topic note: {view.topicLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="rrow">
        <div className="rh">
          <span className="label">Experts to tag</span>
          <span className="src">optional, you choose</span>
        </div>
        <div className="people">
          {top.map((person) => (
            <label className="person" key={person.id}>
              <Avatar person={person} />
              <span>
                <b style={{ fontWeight: 500 }}>{person.name}</b>
                {person.active ? <span className="tag ink"> Active</span> : null}
                <span className="src" style={{ display: "block" }}>
                  Proof: <a href="#proof">{person.answersLine}</a> · last active {person.lastActive}
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
          ))}
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
            <span className="ch">#{view.best.name}</span> is best: {view.best.threads} of {view.topicThreads}{" "}
            threads on this topic. Norm: &ldquo;{view.best.norm}&rdquo;
          </div>
          <fieldset style={{ border: 0 }}>
            <legend className="sr-only">Post in</legend>
            <div className="postin">
              {view.postCandidates.map((channel) => (
                <label className="cb" key={channel.name}>
                  <input
                    type="checkbox"
                    checked={selected.includes(channel.name)}
                    onChange={() => onToggleChannel(channel.name)}
                  />
                  <span className="ch">#{channel.name}</span>
                  <span className="muted small">{channel.workspace}</span>
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
            <Button size="sm">Copy{tagged.length ? ` with ${tagged.length} tag${tagged.length === 1 ? "" : "s"}` : ""}</Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#open">Open #{selected[0] ?? view.best.name}</a>
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
