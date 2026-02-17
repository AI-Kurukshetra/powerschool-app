import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { readSupabaseEnv } from "./env";

export function createActionClient(): SupabaseClient {
  const { url, anonKey } = readSupabaseEnv();
  const cookieStore = cookies();

  console.info("[supabase] Creating server action client");

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach((cookie) => {
          cookieStore.set(cookie);
        });
      },
    },
  });
}
