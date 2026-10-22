"use client";

import { useState } from "react";

import { AskOnce } from "@/components/ask-once";
import { Button } from "@/components/ui/button";
import { WorkspaceApp } from "@/components/workspace-app";
import { SAMPLE, type AppView } from "@/lib/sample-data";

const VIEWS: { id: AppView; label: string }[] = [
  { id: "ask-once", label: "Ask once" },
  { id: "workspace", label: "Workspace" },
];

export function GrapevineApp() {
  const view = SAMPLE;
  const [appView, setAppView] = useState<AppView>("ask-once");
  const [demoTick, setDemoTick] = useState(0);

  function playDemo() {
    setDemoTick((tick) => tick + 1);
  }

  function renderView() {
    switch (appView) {
      case "ask-once":
        return <AskOnce key={demoTick} view={view} onOpenWorkspace={() => setAppView("workspace")} />;
      case "workspace":
        return <WorkspaceApp key={demoTick} />;
      default: {
        const _exhaustive: never = appView;
        return _exhaustive;
      }
    }
  }

  return (
    <div>
      <header>
        <span className="brand">Grapevine</span>
        <span className="seg app-tabs" role="tablist" aria-label="App view">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-controls={`view-${item.id}`}
              aria-selected={appView === item.id}
              onClick={() => setAppView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </span>
        <div className="hright">
          <span className="tag">Sample data</span>
          <span className="muted who small">{view.me.name}</span>
          <Button type="button" onClick={playDemo}>
            Play demo
          </Button>
        </div>
      </header>
      {renderView()}
    </div>
  );
}
