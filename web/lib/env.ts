/**
 * Read Supabase config from process.env only.
 * Never log, print, or interpolate these values into the UI.
 */
export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export function readSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function hasSupabaseKeys(env: SupabasePublicEnv = readSupabasePublicEnv()): boolean {
  return env.url.length > 0 && env.anonKey.length > 0;
}
