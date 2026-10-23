"use client";

import { ComposeBox } from "@/components/compose-box";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { Button } from "@/components/ui/button";
import { copyText, openUrl } from "@/lib/copy-text";
import type { DataSource } from "@/lib/data/types";
import { useAsk } from "@/lib/use-ask";
import type { KnownThread, SampleView } from "@/lib/sample-data";

type AskOnceProps = {
  view: SampleView;
  source: DataSource;
  onOpenWorkspace: () => void;
  onToast: (message: string) => void;
  cueQuestion?: string;
  cueAsked?: boolean;
};

function MatchList({
  matches,
  message,
  asked,
  onToast,
}: {
  matches: KnownThread[];
  message: string | null;
  asked: boolean;
  onToast: (text: string) => void;
}) {
  if (!asked) {
    return <p className="src">Type a question and press Ask. Suggestions are below the box, not a chat message.</p>;
  }
  if (message && !matches.length) {
    return <p className="src">{message}</p>;
  }
  return (
    <ul className="list">
      {matches.map((match, index) => (
        <li key={`${match.channel}-${match.date}-${index}`}>
          <span className="grow">
            <span className="snip">{match.snippet}</span>
            <span className="src">
              {match.authorName} · #{match.channel} · {match.date}
              {" · "}
              <button
                className="more"
                type="button"
                onClick={() => {
                  if (!openUrl(match.url)) {
                    onToast("No live thread link for this message.");
                  }
                }}
              >
                Open thread
              </button>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AskOnce({ view, source, onOpenWorkspace, onToast, cueQuestion, cueAsked }: AskOnceProps) {
  const { draft, setDraft, asked, asking, matches, askMessage, ask } = useAsk(source, view, cueQuestion, cueAsked);
  const bestUrl = view.postCandidates.find((row) => row.name === view.best.name)?.url ?? null;

  return (
    <main className="ask-once" id="view-ask-once" role="tabpanel" aria-labelledby="tab-ask-once">
      <h1>Ask once</h1>
      <ComposeBox
        id="ask-once-q"
        label="Your question"
        draft={draft}
        rows={2}
        placeholder="Type your question once"
        suggestions={view.suggestedQuestions}
        asking={asking}
        asked={asked}
        onChange={setDraft}
        onAsk={(question) => void ask(question)}
      />

      <section className="panel ask-once-graph" aria-label="Who knows">
        <div className="ph">
          <span className="label">Who knows</span>
          <span className="src">{view.topicLabel}</span>
        </div>
        <KnowledgeGraph
          view={view}
          caption={
            view.source === "live"
              ? "Knowledge graph by Cognee Cloud"
              : "Circle size is answers on this topic. Graph by Cognee."
          }
        />
      </section>

      <div className="ask-once-facts">
        <section>
          <span className="label">Already known</span>
          <MatchList matches={matches} message={askMessage} asked={asked} onToast={onToast} />
        </section>
        <section>
          <span className="label">Where to post</span>
          <p>
            <span className="ch">#{view.best.name}</span> · {view.best.norm}
          </p>
          <div className="acts">
            <Button
              size="sm"
              onClick={async () => {
                const copied = await copyText(draft || view.suggestedQuestions[0] || "");
                if (copied) {
                  onToast("Copied. Nothing was posted.");
                }
                if (!openUrl(bestUrl)) {
                  onToast(`No live link for #${view.best.name}`);
                }
              }}
            >
              Copy and open #{view.best.name}
            </Button>
            <span className="src" style={{ margin: 0 }}>
              Nothing is posted for you.
            </span>
          </div>
        </section>
      </div>

      <p className="ask-once-more">
        <button className="more" type="button" onClick={onOpenWorkspace}>
          Open Workspace
        </button>
      </p>
    </main>
  );
}
