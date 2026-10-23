"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { copyText, openUrl } from "@/lib/copy-text";
import type { Person, SampleView } from "@/lib/sample-data";

function Avatar({ person }: { person: Person }) {
  return (
    <span className="av" aria-hidden="true">
      {person.initials}
    </span>
  );
}

export function AnnounceResults({
  view,
  draft,
  onToast,
}: {
  view: SampleView;
  draft: string;
  onToast: (message: string) => void;
}) {
  const [mentors, setMentors] = useState<string[]>(() => view.experts.slice(0, 2).map((person) => person.id));
  const a = view.announce;
  const contacts = a.contact.filter((person) => person.roles.length);

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
          {a.where.length ? (
            a.where.map((row, index) => (
              <div className={index ? "arow sp" : "arow"} key={row.ch}>
                <span className="ch">#{row.ch}</span>
                <span className="src" style={{ margin: 0 }}>
                  {row.why}. Rule {row.rule}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const ok = await copyText(draft);
                    if (ok) {
                      onToast("Copied. Nothing was posted.");
                    }
                    const target = view.postCandidates.find((channel) => channel.name === row.ch);
                    if (!openUrl(row.url ?? target?.url ?? null)) {
                      onToast(`No live link for #${row.ch}`);
                    }
                  }}
                >
                  Copy and open
                </Button>
              </div>
            ))
          ) : (
            <p className="src">No posting rules loaded yet. Public channels only.</p>
          )}
        </div>
      </div>

      <div className="rrow blocked">
        <div className="rh">
          <span className="label" style={{ color: "var(--warn)" }}>
            Not here
          </span>
        </div>
        <div>
          {a.blocked.length ? (
            a.blocked.map((row) => (
              <div key={row.ch}>
                <div>
                  <span className="ch">#{row.ch}</span> · {row.workspace}
                </div>
                <blockquote>&ldquo;{row.quote}&rdquo;</blockquote>
                <div className="src">Rule {row.rule}</div>
              </div>
            ))
          ) : (
            <p className="src">No blocked-channel rules in this live set.</p>
          )}
        </div>
      </div>

      <div className="rrow">
        <div className="rh">
          <span className="label">Contact first</span>
          <span className="src">moderators and organisers</span>
        </div>
        <div className="people">
          {contacts.length ? (
            contacts.map((person) => (
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const ok = await copyText(`Hi ${person.name}, could you take a look at this announcement?`);
                    onToast(ok ? "Draft note copied." : "Could not copy.");
                  }}
                >
                  Draft note
                </Button>
              </div>
            ))
          ) : (
            <p className="src">No moderators tagged in the live people table.</p>
          )}
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
                  {person.goto} · {person.answersLine}
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
            <Button
              size="sm"
              onClick={async () => {
                const names = view.experts.filter((person) => mentors.includes(person.id)).map((person) => person.name);
                const ok = await copyText(`Mentor invite for ${names.join(", ")}:\n\n${draft}`);
                onToast(ok ? `Drafted ${mentors.length} mentor invites.` : "Could not copy.");
              }}
            >
              Draft {mentors.length} mentor invites
            </Button>
            <span className="src" style={{ margin: 0 }}>
              Best time to post: {a.bestTime}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
