"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Person, SampleView } from "@/lib/sample-data";

type SimpleAskProps = {
  view: SampleView;
  onOpenWorkspace: () => void;
};

function Avatar({ person }: { person: Person }) {
  return (
    <span className="av" aria-hidden="true">
      {person.initials}
    </span>
  );
}

export function SimpleAsk({ view, onOpenWorkspace }: SimpleAskProps) {
  const [draft, setDraft] = useState(view.question);
  const known = view.known;
  const who = view.whoToTag.slice(0, 2);

  return (
    <main className="simple" id="view-simple" role="tabpanel" aria-labelledby="tab-simple">
      <h1>Ask once</h1>
      <p className="lede">See what is already known, who knows it, and where to post.</p>
      <div className="compose">
        <label htmlFor="simple-q" className="sr-only">
          Your question
        </label>
        <textarea
          id="simple-q"
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type your question once"
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
      </p>
      <ol className="simple-answers" aria-label="Answers">
        <li className="srow">
          <span className="anum" aria-hidden="true">
            1
          </span>
          <div>
            <span className="label">Already known</span>
            <div>&ldquo;{known.title}&rdquo;</div>
            <p className="src">
              <span className="snip">{known.snippet}</span>
            </p>
            <p className="src">
              {known.authorName} · #{known.channel} · {known.date} · {known.replies} replies
            </p>
          </div>
        </li>
        <li className="srow">
          <span className="anum" aria-hidden="true">
            2
          </span>
          <div>
            <span className="label">Who knows</span>
            <div className="people">
              {who.map((person) => (
                <div className="person" key={person.id}>
                  <Avatar person={person} />
                  <span>
                    <b style={{ fontWeight: 500 }}>{person.name}</b>
                    <span className="src" style={{ display: "block" }}>
                      {person.answersLine} · last active {person.lastActive}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </li>
        <li className="srow">
          <span className="anum" aria-hidden="true">
            3
          </span>
          <div>
            <span className="label">Where to post</span>
            <p>
              <span className="ch">#{view.best.name}</span> is best. Norm: &ldquo;{view.best.norm}&rdquo;
            </p>
            <p className="src">{view.crossPostRule.text.split(". ")[0]}.</p>
            <div className="acts">
              <Button size="sm">Copy and open #{view.best.name}</Button>
              <span className="src" style={{ margin: 0 }}>
                Nothing is posted for you.
              </span>
            </div>
          </div>
        </li>
      </ol>
      <p className="simple-more">
        <button className="more" type="button" onClick={onOpenWorkspace}>
          Open Workspace for library, announce and growth
        </button>
      </p>
    </main>
  );
}
