export function EndCard() {
  return (
    <div className="endwrap" role="status">
      <div className="endcard">
        <span className="brand big">Grapevine</span>
        <p className="pitch">Ask once. See what is known, who knows it, and where to post.</p>
        <div className="panel built">
          <div className="ph">
            <span className="label">How it was built</span>
          </div>
          <div className="rrow">
            <div className="rh">
              <b style={{ fontWeight: 500 }}>Grok Bot</b>
              <span className="label">Context</span>
            </div>
            <div className="src" style={{ margin: 0 }}>
              Held the plan and loaded live Discord into Supabase and Cognee Cloud.
            </div>
          </div>
          <div className="rrow">
            <div className="rh">
              <b style={{ fontWeight: 500 }}>Cursor</b>
              <span className="label">Build</span>
            </div>
            <div className="src" style={{ margin: 0 }}>
              Local agents built the app. Every commit is tagged [cursor], [grok-bot] or [mani].
            </div>
          </div>
          <div className="rrow">
            <div className="rh">
              <b style={{ fontWeight: 500 }}>Supabase</b>
              <span className="label">Search</span>
            </div>
            <div className="src" style={{ margin: 0 }}>
              Hybrid route_question search finds matching messages, people and channels.
            </div>
          </div>
          <div className="rrow">
            <div className="rh">
              <b style={{ fontWeight: 500 }}>Cognee Cloud</b>
              <span className="label">Graph</span>
            </div>
            <div className="src" style={{ margin: 0 }}>
              Hosted graph of people and topics behind Experts.
            </div>
          </div>
          <div className="foot src">
            Proof in the repo: <span className="ch">docs/BUILT-WITH.md</span>,{" "}
            <span className="ch">PROGRESS.md</span> and the tagged commits.
          </div>
        </div>
      </div>
    </div>
  );
}
