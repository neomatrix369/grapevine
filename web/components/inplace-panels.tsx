"use client";

import { useState } from "react";

import { DotIcon, TickIcon } from "@/components/icons";
import { KnowledgeGraph } from "@/components/knowledge-graph";
import { Button } from "@/components/ui/button";
import {
  coverageLabel,
  postStatusLabel,
  type Panel,
  type Person,
  type SampleView,
} from "@/lib/sample-data";

type InPlacePanelsProps = {
  panel: Panel;
  view: SampleView;
};

function Avatar({ person }: { person: Pick<Person, "initials"> }) {
  return (
    <span className="av" aria-hidden="true">
      {person.initials}
    </span>
  );
}

function LibraryPanel({ view }: { view: SampleView }) {
  return (
    <>
      <div className="search">
        <label htmlFor="lib-q" className="sr-only">
          Search the library
        </label>
        <input id="lib-q" placeholder="Search the library" defaultValue="golden set" />
      </div>
      <div className="sec">
        <span className="label">Topics</span>
        <div className="chips" role="group" aria-label="Topic filter">
          <button className="chip" type="button" aria-pressed="true">
            {view.topicLabel} · {view.topicThreads}
          </button>
          {view.subtopics.map((topic) => (
            <button className="chip" type="button" aria-pressed="false" key={topic.label}>
              {topic.label} · {topic.thread_count}
            </button>
          ))}
        </div>
      </div>
      <div className="sec">
        <span className="label">Note: {view.topicLabel}</span>
        <p className="summary">{view.topicSummary}</p>
        <p className="src">
          From{" "}
          <a href="#sources">
            {view.topicThreads} threads, {view.topicMessages} messages
          </a>{" "}
          in {view.topicChannels} public channels, up to {view.topicUpTo}.
        </p>
      </div>
      <div className="sec">
        <span className="label">Source threads</span>
        <ul className="list">
          {view.libraryThreads.map((thread) => (
            <li key={thread.title}>
              <span className="grow">
                <a href="#thread" className="ell">
                  {thread.title}
                </a>
                <span className="src">
                  {thread.authorName} · #{thread.channel} · {thread.date}
                </span>
              </span>
              <span className="cnt">{thread.replies} replies</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="sec">
        <span className="label">Most shared links</span>
        <ul className="list">
          {view.sharedLinks.map((link) => (
            <li key={link.label}>
              <span className="grow">
                <a href="#link" className="ell">
                  {link.label}
                </a>
                <span className="src">
                  shared {link.times === 1 ? "once" : `${link.times} times`}, first by {link.first}
                </span>
              </span>
              <span className="cnt">{link.replies} replies</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ExpertsPanel({ view }: { view: SampleView }) {
  const [graph, setGraph] = useState(false);
  const rows = view.experts.slice(0, 6);

  return (
    <>
      <div className="tp-h">
        <div className="chips" role="group" aria-label="Filter">
          <button className="chip" type="button" aria-pressed="true">
            {view.topicLabel}
          </button>
          <button className="chip" type="button" aria-pressed="false">
            All communities
          </button>
        </div>
        <span className="seg" role="group" aria-label="View">
          <button type="button" aria-pressed={!graph} onClick={() => setGraph(false)}>
            List
          </button>
          <button type="button" aria-pressed={graph} onClick={() => setGraph(true)}>
            Graph
          </button>
        </span>
      </div>
      {graph ? (
        <KnowledgeGraph
          view={view}
          listHint
          caption="Knowledge graph by Cognee. Circle size and number are answers on this topic; line thickness is shared threads. Blue lines are your own links, only you see them."
        />
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th scope="col">
                  <span className="label">Person</span>
                </th>
                <th scope="col">
                  <span className="label">Proof</span>
                </th>
                <th scope="col" aria-sort="descending" className="num">
                  <span className="label">Answers</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((person) => (
                <tr key={person.id}>
                  <td>
                    <div className="pcell">
                      <Avatar person={person} />
                      <span>
                        <b style={{ fontWeight: 500 }}>{person.name}</b>
                        {person.active || person.roles.length ? (
                          <span className="badges">
                            {person.active ? <span className="tag ink">Active</span> : null}
                            {person.roles.map((role) => (
                              <span className="tag" key={role}>
                                {role}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </td>
                  <td>
                    <a href="#proof">{person.answersLine.replace(/^\d+ answers? in /, "")}</a>
                    <span className="src" style={{ display: "block" }}>
                      last active {person.lastActive}
                    </span>
                  </td>
                  <td className="num">{person.answers}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="caption">
            Public channels only. Answers are replies in threads someone else started. Under 2 answers, nobody is
            called an expert.
          </p>
        </>
      )}
    </>
  );
}

function PostsPanel({ view }: { view: SampleView }) {
  return (
    <>
      <div className="tp-h">
        <span className="label">Private · only you see this</span>
      </div>
      <ul className="list posts">
        {view.myPosts.map((post) => (
          <li key={post.text}>
            <span className="grow">
              <span className="ell">
                {post.kind === "announce" ? <span className="tag">Announce</span> : null} {post.text}
              </span>
              <span className="src">
                #{post.channel} · {post.workspace} · {post.at}
                {post.tagged.length ? ` · tagged ${post.tagged.join(", ")}` : ""}
                {post.answeredBy ? ` · answered by ${post.answeredBy}` : ""}
                {post.reactions ? ` · ${post.reactions} reactions` : ""}
              </span>
              <span className="src">
                {post.source === "grapevine" ? "Started here, posted by you" : "Found in channels read"}
              </span>
            </span>
            <span className={`pstat ${post.status}`}>
              {post.status === "awaiting" ? <DotIcon /> : post.status === "answered" ? <TickIcon /> : null}
              {postStatusLabel(post.status)}
              {post.replies && post.status !== "awaiting" ? ` · ${post.replies}` : ""}
            </span>
          </li>
        ))}
      </ul>
      <p className="caption">Status comes from the next read of each channel. Nothing here is visible to anyone else.</p>
    </>
  );
}

function GrowthPanel({ view }: { view: SampleView }) {
  const max = Math.max(...view.growth.weeks.map((week) => week.n));
  return (
    <>
      <div className="kpis">
        {view.growth.kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <span className="label">{kpi.label}</span>
            <span className="big">{kpi.value}</span>
            <span className="src">{kpi.note}</span>
          </div>
        ))}
      </div>
      <div className="sec">
        <span className="label">Threads in the library, running total by week</span>
        <div className="wk-bars">
          {view.growth.weeks.map((week) => (
            <div className="wkb" key={week.label}>
              <span className="n">{week.n}</span>
              <i style={{ height: `${Math.max(4, (week.n / max) * 72)}px` }} />
              <span className="label">{week.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sec">
        <span className="label">Coverage, since {view.cutoff}</span>
        <ul className="list">
          {view.coverage.map((row) => (
            <li key={row.channel_name}>
              <span className="grow">
                <span className="ch">#{row.channel_name}</span>{" "}
                <span className="muted small">{row.workspace}</span>
              </span>
              <span className="cnt">{coverageLabel(row)}</span>
            </li>
          ))}
        </ul>
        <div className="gap">
          <span>
            Biggest gap: <span className="ch">#{view.gap}</span>
          </span>
          <Button size="sm">Read next</Button>
        </div>
      </div>
      <div className="sec">
        <span className="label">New experts</span>
        <p className="src">None since your last visit.</p>
      </div>
    </>
  );
}

export function InPlaceBody({ panel, view }: InPlacePanelsProps) {
  switch (panel) {
    case "library":
      return <LibraryPanel view={view} />;
    case "experts":
      return <ExpertsPanel view={view} />;
    case "posts":
      return <PostsPanel view={view} />;
    case "growth":
      return <GrowthPanel view={view} />;
    case "compose":
      return null;
    default: {
      const _exhaustive: never = panel;
      return _exhaustive;
    }
  }
}
