import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { readSupabaseEnv } from "./env";

describe("readSupabaseEnv", () => {
  it("returns required values when set", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";

    const env = readSupabaseEnv();

    assert.equal(env.url, "https://example.supabase.co");
    assert.equal(env.anonKey, "anon");
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";

    assert.throws(() => readSupabaseEnv(), /NEXT_PUBLIC_SUPABASE_URL/);
  });

  it("throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    assert.throws(() => readSupabaseEnv(), /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });
});
