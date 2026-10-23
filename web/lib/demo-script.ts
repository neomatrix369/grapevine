import type { AppView, Mode, Panel, SampleView } from "@/lib/sample-data";

export const DEMO_STEP_MS = 3000;

export type DemoCue = {
  id: string;
  label: string;
  appView: AppView;
  question?: string;
  asked?: boolean;
  panel?: Panel | null;
  mode?: Mode;
  end?: boolean;
};

export function demoQuestion(view: SampleView): string {
  return view.suggestedQuestions[0] ?? view.question;
}

export function demoCues(view: SampleView): DemoCue[] {
  const question = demoQuestion(view);
  return [
    { id: "land", label: "Land", appView: "ask-once" },
    { id: "ask", label: "Type a question", appView: "ask-once", question },
    { id: "known", label: "Already known", appView: "ask-once", question, asked: true },
    { id: "workspace", label: "Experts", appView: "workspace", question, asked: true },
    { id: "write", label: "Where to post", appView: "workspace", question, asked: true },
    { id: "posts", label: "My posts", appView: "workspace", question, asked: true, panel: "posts" },
    { id: "growth", label: "Growth", appView: "workspace", question, asked: true, panel: "growth" },
    { id: "announce", label: "Announce", appView: "workspace", mode: "announce", panel: null },
    { id: "end", label: "How it was built", appView: "ask-once", end: true },
  ];
}
