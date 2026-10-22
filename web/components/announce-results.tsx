"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Person, SampleView } from "@/lib/sample-data";

function Avatar({ person }: { person: Person }) {
  return (
    <span className="av" aria-hidden="true">
      {person.initials}
    </span>
  );
}

export function AnnounceResults({ view }: { view: SampleView }) {
  const [mentors, setMentors] = useState<string[]>(["p-cleo", "p-kemi"]);
  const a = view.announce;

  function toggleMentor(id: string) {
    setMentors((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 3),
    );
  }

  return (
    <section className="panel results" aria-live="polite" aria-label="Results">
      <div className="rrow">
        <div className="rh">
          <span className="label">Allowed here</span>
          <span className="src">rule quoted</span>
        </div>
        <div>
          {a.where.map((row, index) => (
            <div className={index ? "arow sp" : "arow"} key={row.ch}>
              <span className="ch">#{row.ch}</span>
              <span className="src" style={{ margin: 0 }}>
                {row.why}. <a href="#rule">Rule {row.rule}</a>
              </span>
              <Button variant="ghost" size="sm">
                Copy and open
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rrow blocked">
        <div className="rh">
          <span className="label" style={{ color: "var(--warn)" }}>
            Not here
          </span>
        </div>
        <div>
          {a.blocked.map((row) => (
            <div key={row.ch}>
              <div>
                <span className="ch">#{row.ch}</span> · {row.workspace}
              </div>
              <blockquote>&ldquo;{row.quote}&rdquo;</blockquote>
              <div className="src">
                Rule <a href="#blocked">{row.rule}</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rrow">
        <div className="rh">
          <span className="label">Contact first</span>
          <span className="src">moderators and organisers</span>
        </div>
        <div className="people">
          {a.contact
            .filter((person) => person.roles.length)
            .map((person) => (
              <div className="person" key={person.id}>
                <Avatar person={person} />
                <span>
                  <b style={{ fontWeight: 500 }}>{person.name}</b>{" "}
                  {person.roles.map((role) => (
                    <span className="tag" key={role}>
                      {role}
                    </span>
                  ))}
                  <span className="src" style={{ display: "block" }}>
                    {person.goto}
                  </span>
                </span>
                <Button variant="ghost" size="sm">
                  Draft note
                </Button>
              </div>
            ))}
        </div>
      </div>

      <div className="rrow">
        <div className="rh">
          <span className="label">Pick mentors</span>
          <span className="src">{mentors.length} of 3 picked</span>
        </div>
        <div className="people">
          {view.experts.slice(0, 4).map((person) => (
            <label className="person" key={person.id}>
              <Avatar person={person} />
              <span>
                <b style={{ fontWeight: 500 }}>{person.name}</b>
                {person.active ? <span className="tag ink"> Active</span> : null}
                <span className="src" style={{ display: "block" }}>
                  {person.goto} · <a href="#proof">{person.answersLine}</a>
                </span>
              </span>
              <span className="cb">
                <input
                  type="checkbox"
                  checked={mentors.includes(person.id)}
                  onChange={() => toggleMentor(person.id)}
                />{" "}
                Mentor
              </span>
            </label>
          ))}
          <div className="acts">
            <Button size="sm">Draft {mentors.length} mentor invites</Button>
            <span className="src" style={{ margin: 0 }}>
              Best time to post: {a.bestTime}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
