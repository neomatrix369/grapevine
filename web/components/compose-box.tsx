"use client";

import { Button } from "@/components/ui/button";

type ComposeBoxProps = {
  id: string;
  label: string;
  draft: string;
  rows: number;
  placeholder: string;
  suggestions: string[];
  asking: boolean;
  asked: boolean;
  askLabel?: string;
  onChange: (value: string) => void;
  onAsk: (question?: string) => void;
};

export function ComposeBox({
  id,
  label,
  draft,
  rows,
  placeholder,
  suggestions,
  asking,
  asked,
  askLabel = "Ask",
  onChange,
  onAsk,
}: ComposeBoxProps) {
  const empty = draft.trim().length === 0;
  return (
    <>
      <div className="compose">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <textarea
          id={id}
          rows={rows}
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <div className="compose-foot">
          <Button type="button" size="sm" disabled={empty || asking} onClick={() => onAsk()}>
            {asking ? "Searching…" : askLabel}
          </Button>
        </div>
      </div>
      {empty && !asked ? (
        <div className="chips suggestions" role="group" aria-label="Suggested questions">
          {suggestions.map((question) => (
            <button
              key={question}
              className="chip"
              type="button"
              onClick={() => {
                onChange(question);
              }}
            >
              {question}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
