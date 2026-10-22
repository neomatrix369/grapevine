"use client";

import { useState } from "react";

import { KnowledgeGraph } from "@/components/knowledge-graph";
import { Button } from "@/components/ui/button";
import type { SampleView } from "@/lib/sample-data";

type SimpleAskProps = {
  view: SampleView;
  onOpenWorkspace: () => void;
};

export function SimpleAsk({ view, onOpenWorkspace }: SimpleAskProps) {
  const [draft, setDraft] = useState(view.question);
  const known = view.known;

  return (
    <main className="simple" id="view-simple" role="tabpanel" aria-labelledby="tab-simple">
      <h1>Ask once</h1>
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

      <section className="panel simple-graph" aria-label="Who knows">
        <div className="ph">
          <span className="label">Who knows</span>
          <span className="src">{view.topicLabel}</span>
        </div>
        <KnowledgeGraph
          view={view}
          caption="Circle size is answers on this topic. Graph by Cognee."
        />
      </section>

      <div className="simple-facts">
        <section>
          <span className="label">Already known</span>
          <p>
            <span className="snip">{known.snippet}</span>
          </p>
          <p className="src">
            {known.authorName} · #{known.channel} · {known.date}
          </p>
        </section>
        <section>
          <span className="label">Where to post</span>
          <p>
            <span className="ch">#{view.best.name}</span> · {view.best.norm}
          </p>
          <div className="acts">
            <Button size="sm">Copy and open #{view.best.name}</Button>
            <span className="src" style={{ margin: 0 }}>
              Nothing is posted for you.
            </span>
          </div>
        </section>
      </div>

      <p className="simple-more">
        <button className="more" type="button" onClick={onOpenWorkspace}>
          Open Workspace
        </button>
      </p>
    </main>
  );
}
