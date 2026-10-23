"use client";

import { useEffect, useState } from "react";

import { AskOnce } from "@/components/ask-once";
import { EndCard } from "@/components/end-card";
import { SourceToggle } from "@/components/source-toggle";
import { Button } from "@/components/ui/button";
import { WorkspaceApp } from "@/components/workspace-app";
import { DEMO_STEP_MS, demoCues } from "@/lib/demo-script";
import type { CommunityResponse, DataSource, LiveStatus } from "@/lib/data/types";
import { SAMPLE, type AppView } from "@/lib/sample-data";

const VIEWS: { id: AppView; label: string }[] = [
  { id: "ask-once", label: "Ask once" },
  { id: "workspace", label: "Workspace" },
];

function liveNote(status: LiveStatus | "loading", label: string): string {
  switch (status) {
    case "loading":
      return "Reading…";
    case "ok":
      return label || "Live";
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
  const [source, setSource] = useState<DataSource>("sample");
  const [live, setLive] = useState<CommunityResponse | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [demoIndex, setDemoIndex] = useState(-1);

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
  }, [source]);

  const view = source === "sample" ? SAMPLE : live?.view;
  const cues = view ? demoCues(view) : [];
  const cue = playing && demoIndex >= 0 ? cues[demoIndex] : undefined;

  useEffect(() => {
    if (!playing) {
      return;
    }
    const timer = window.setInterval(() => {
      setDemoIndex((index) => {
        if (index + 1 >= cues.length) {
          window.clearInterval(timer);
          return index;
        }
        return index + 1;
      });
    }, DEMO_STEP_MS);
    return () => window.clearInterval(timer);
  }, [playing, cues.length]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function changeSource(next: DataSource) {
    setLive(null);
    setLiveFailed(false);
    setSource(next);
    stopDemo();
  }

  function playDemo() {
    document.documentElement.classList.remove("dark");
    setPlaying(true);
    setDemoIndex(0);
    setAppView("ask-once");
  }

  function stopDemo() {
    setPlaying(false);
    setDemoIndex(-1);
  }

  const shownView = cue?.appView ?? appView;
  const liveStatus: LiveStatus | "loading" = liveFailed
    ? "unreachable"
    : live
      ? live.status
      : "loading";
  const note = source === "sample" ? "Sample data" : liveNote(liveStatus, view?.sourceLabel ?? "Live");
  const showBanner =
    source === "live" &&
    (liveStatus === "empty" ||
      liveStatus === "unreachable" ||
      (liveStatus === "ok" && live?.graphSource === "none"));
  const banner = showBanner ? live?.message ?? note : null;

  function renderView() {
    if (cue?.end) {
      return <EndCard />;
    }
    if (!view) {
      return (
        <main className="ask-once" aria-busy={liveStatus === "loading"}>
          <p className="muted">{note}</p>
          {liveStatus === "unreachable" ? (
            <p className="acts">
              <Button type="button" onClick={() => changeSource("live")}>
                Retry live
              </Button>
            </p>
          ) : null}
        </main>
      );
    }
    switch (shownView) {
      case "ask-once":
        return (
          <AskOnce
            view={view}
            source={source}
            onOpenWorkspace={() => setAppView("workspace")}
            onToast={showToast}
            cueQuestion={cue?.question}
            cueAsked={cue?.asked}
          />
        );
      case "workspace":
        return (
          <WorkspaceApp
            view={view}
            source={source}
            onToast={showToast}
            cueQuestion={cue?.question}
            cueAsked={cue?.asked}
            cuePanel={cue?.panel}
            cueMode={cue?.mode}
          />
        );
      default: {
        const _exhaustive: never = shownView;
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
              aria-selected={shownView === item.id}
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
          <Button type="button" disabled={!view && !playing} onClick={playing ? stopDemo : playDemo}>
            {playing ? "Stop" : "Play demo"}
          </Button>
        </div>
      </header>
      {playing && cue ? (
        <p className="demo-progress" role="status">
          Demo {demoIndex + 1} of {cues.length}: {cue.label}
        </p>
      ) : null}
      {banner ? (
        <p className="live-banner" role="status">
          {banner}
        </p>
      ) : null}
      {renderView()}
      {toast ? (
        <p className="toast" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
