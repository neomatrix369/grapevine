import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { hasSupabaseServerEnv, readSupabaseServerEnv } from "@/lib/env-server";

export function createSupabaseServerClient(): SupabaseClient | null {
  const env = readSupabaseServerEnv();
  if (!hasSupabaseServerEnv(env)) {
    return null;
  }
  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
