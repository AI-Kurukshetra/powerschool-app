import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type HealthResponse = {
  ok: boolean;
  error?: string;
};

export async function GET() {
  const supabase = createClient();

  try {
    const { error } = await supabase.from("schools").select("id").limit(1);

    if (error) {
      return NextResponse.json<HealthResponse>(
        { ok: false, error: "Supabase query failed." },
        { status: 503 },
      );
    }

    return NextResponse.json<HealthResponse>({ ok: true });
  } catch (error) {
    console.error("[health] Supabase check failed", error);
    return NextResponse.json<HealthResponse>(
      { ok: false, error: "Supabase connection failed." },
      { status: 503 },
    );
  }
}
