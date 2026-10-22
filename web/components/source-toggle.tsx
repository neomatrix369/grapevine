"use client";

import type { DataSource } from "@/lib/data/types";

type SourceToggleProps = {
  source: DataSource;
  onChange: (source: DataSource) => void;
};

const OPTIONS: { id: DataSource; label: string }[] = [
  { id: "sample", label: "Sample" },
  { id: "live", label: "Live" },
];

export function SourceToggle({ source, onChange }: SourceToggleProps) {
  return (
    <span className="seg source-toggle" role="group" aria-label="Data source">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={source === option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </span>
  );
}
