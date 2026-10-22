"use client";

import { useEffect, useState } from "react";

import { AskOnce } from "@/components/ask-once";
import { SourceToggle } from "@/components/source-toggle";
import { Button } from "@/components/ui/button";
import { WorkspaceApp } from "@/components/workspace-app";
import type { CommunityResponse, DataSource, LiveStatus } from "@/lib/data/types";
import { SAMPLE, type AppView } from "@/lib/sample-data";

const VIEWS: { id: AppView; label: string }[] = [
  { id: "ask-once", label: "Ask once" },
  { id: "workspace", label: "Workspace" },
];

function liveNote(status: LiveStatus | "loading"): string {
  switch (status) {
    case "loading":
      return "Reading…";
    case "ok":
      return "Slack + Discord";
    case "empty":
      return "No rows yet";
    case "unreachable":
      return "Unreachable";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function GrapevineApp() {
  const [appView, setAppView] = useState<AppView>("ask-once");
  const [demoTick, setDemoTick] = useState(0);
  const [source, setSource] = useState<DataSource>("sample");
  const [live, setLive] = useState<CommunityResponse | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);

  useEffect(() => {
    if (source !== "live") {
      return;
    }
    let cancelled = false;
    fetch("/api/community", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("community-http");
        }
        return (await response.json()) as CommunityResponse;
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setLiveFailed(false);
        setLive(payload);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setLive(null);
        setLiveFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [source, demoTick]);

  function changeSource(next: DataSource) {
    setLive(null);
    setLiveFailed(false);
    setSource(next);
  }

  function playDemo() {
    setLive(null);
    setLiveFailed(false);
    setDemoTick((tick) => tick + 1);
  }

  const liveStatus: LiveStatus | "loading" = liveFailed
    ? "unreachable"
    : live
      ? live.status
      : "loading";
  const view = source === "sample" ? SAMPLE : live?.view;
  const note = source === "sample" ? "Sample data" : liveNote(liveStatus);
  const banner = source === "live" && liveStatus !== "ok" && liveStatus !== "loading" ? live?.message ?? note : null;

  function renderView() {
    if (!view) {
      return (
        <main className="ask-once" aria-busy={liveStatus === "loading"}>
          <p className="muted">{note}</p>
          {liveStatus === "unreachable" ? (
            <p className="acts">
              <Button type="button" onClick={playDemo}>
                Retry live
              </Button>
            </p>
          ) : null}
        </main>
      );
    }
    switch (appView) {
      case "ask-once":
        return <AskOnce key={`${source}-${demoTick}`} view={view} onOpenWorkspace={() => setAppView("workspace")} />;
      case "workspace":
        return <WorkspaceApp key={`${source}-${demoTick}`} view={view} />;
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
          <SourceToggle source={source} onChange={changeSource} />
          <span className="muted who small source-note">{note}</span>
          <span className="muted who small">{view?.me.name ?? "Live"}</span>
          <Button type="button" onClick={playDemo}>
            Play demo
          </Button>
        </div>
      </header>
      {banner ? (
        <p className="live-banner" role="status">
          {banner}
        </p>
      ) : null}
      {renderView()}
    </div>
  );
}
