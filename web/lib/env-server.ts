import "server-only";

/**
 * Server-only env. Never import this from a client component.
 * Do not log or return these values.
 */

export type SupabaseServerEnv = {
  url: string;
  serviceRoleKey: string;
};

export type CogneeServerEnv = {
  apiKey: string;
  baseUrl: string;
  tenantId: string;
  dataset: string;
};

function read(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function readSupabaseServerEnv(): SupabaseServerEnv {
  return {
    url: read("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, ""),
    serviceRoleKey: read("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

export function hasSupabaseServerEnv(
  env: SupabaseServerEnv = readSupabaseServerEnv(),
): boolean {
  return env.url.length > 0 && env.serviceRoleKey.length > 0;
}

export function readCogneeServerEnv(): CogneeServerEnv {
  const raw = read("COGNEE_BASE_URL") || read("COGNEE_API_URL") || read("COGNEE_URL");
  return {
    apiKey: read("COGNEE_API_KEY"),
    baseUrl: raw.replace(/\/+$/, "").replace(/\/api(\/v1)?$/, ""),
    tenantId: read("COGNEE_TENANT_ID"),
    dataset: read("COGNEE_DATASET") || "grapevine",
  };
}

export function hasCogneeServerEnv(env: CogneeServerEnv = readCogneeServerEnv()): boolean {
  return env.apiKey.length > 0 && env.baseUrl.length > 0;
}
