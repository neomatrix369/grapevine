import "server-only";

import { sanitizeGraph } from "@/lib/data/graph-filter";
import { hasCogneeServerEnv, readCogneeServerEnv } from "@/lib/env-server";
import type { GraphEdge, GraphNode, GraphResponse } from "@/lib/data/types";

const TIMEOUT_MS = 8000;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  const record = asRecord(value);
  if (!record) {
    return [];
  }
  if (Array.isArray(record.datasets)) {
    return record.datasets;
  }
  if (Array.isArray(record.nodes) || Array.isArray(record.edges)) {
    return [];
  }
  if (Array.isArray(record.data)) {
    return record.data;
  }
  return [];
}

async function cogneeFetch(path: string): Promise<unknown | null> {
  const env = readCogneeServerEnv();
  if (!hasCogneeServerEnv(env)) {
    return null;
  }
  const headers: Record<string, string> = { "X-Api-Key": env.apiKey };
  if (env.tenantId) {
    headers["X-Tenant-Id"] = env.tenantId;
  }
  try {
    const response = await fetch(`${env.baseUrl}${path}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

function nodeLabel(raw: Record<string, unknown>): string {
  const props = asRecord(raw.properties);
  const candidates = [raw.label, raw.name, props?.name, props?.label, raw.id];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim().slice(0, 80);
    }
  }
  return "node";
}

function nodeId(raw: Record<string, unknown>, fallback: number): string {
  const value = raw.id ?? raw.node_id ?? raw.uuid;
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return `n-${fallback}`;
}

function edgeEnd(raw: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
    const nested = asRecord(value);
    if (nested && (typeof nested.id === "string" || typeof nested.id === "number")) {
      return String(nested.id);
    }
  }
  return null;
}

function isReadableLabel(label: string): boolean {
  if (label.length < 2 || label === "node") {
    return false;
  }
  if (/^documentchunk_/i.test(label)) {
    return false;
  }
  if (/^te?\d{4}/i.test(label)) {
    return false;
  }
  if (/^[0-9a-f-]{20,}$/i.test(label)) {
    return false;
  }
  return true;
}

export function normalizeCogneeGraph(payload: unknown): GraphResponse {
  const root = asRecord(payload) ?? {};
  const rawNodes = Array.isArray(root.nodes) ? root.nodes : [];
  const rawEdges = Array.isArray(root.edges) ? root.edges : [];
  const collected: GraphNode[] = [];
  const seen = new Set<string>();
  rawNodes.forEach((item, index) => {
    const record = asRecord(item);
    if (!record) {
      return;
    }
    const id = nodeId(record, index);
    if (seen.has(id)) {
      return;
    }
    const label = nodeLabel(record);
    if (!isReadableLabel(label)) {
      return;
    }
    seen.add(id);
    const kind =
      typeof record.type === "string"
        ? record.type
        : typeof asRecord(record.properties)?.type === "string"
          ? String(asRecord(record.properties)?.type)
          : "entity";
    collected.push({ id, label, kind });
  });
  const edges: GraphEdge[] = [];
  rawEdges.forEach((item) => {
    const record = asRecord(item);
    if (!record) {
      return;
    }
    const src = edgeEnd(record, ["source", "src", "from"]);
    const dst = edgeEnd(record, ["target", "dst", "to"]);
    if (!src || !dst) {
      return;
    }
    const kind =
      typeof record.label === "string"
        ? record.label
        : typeof record.relationship_name === "string"
          ? record.relationship_name
          : "related";
    edges.push({ src, dst, kind: kind.slice(0, 60) });
  });
  const cleaned = sanitizeGraph(collected, edges);
  return { source: cleaned.nodes.length ? "cognee" : "none", nodes: cleaned.nodes, edges: cleaned.edges };
}

export async function fetchCogneeGraph(): Promise<GraphResponse> {
  const env = readCogneeServerEnv();
  if (!hasCogneeServerEnv(env)) {
    return { source: "none", nodes: [], edges: [] };
  }
  const datasetsPayload = await cogneeFetch("/api/v1/datasets");
  const datasets = asList(datasetsPayload);
  const match = datasets
    .map((item) => asRecord(item))
    .find((item) => item && (item.name === env.dataset || item.id === env.dataset));
  const datasetId = match && (match.id ?? match.dataset_id);
  if (typeof datasetId !== "string" && typeof datasetId !== "number") {
    return { source: "none", nodes: [], edges: [] };
  }
  const graphPayload = await cogneeFetch(`/api/v1/datasets/${datasetId}/graph`);
  if (!graphPayload) {
    return { source: "none", nodes: [], edges: [] };
  }
  return normalizeCogneeGraph(graphPayload);
}
