import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { readSupabaseEnv } from "./env";

export function createClient(): SupabaseClient {
  const { url, anonKey } = readSupabaseEnv();

  console.info("[supabase] Creating browser client");

  return createBrowserClient(url, anonKey);
}
