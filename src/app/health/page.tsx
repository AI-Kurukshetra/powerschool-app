import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type HealthStatus = {
  ok: boolean;
  message: string;
};

async function checkSupabase(): Promise<HealthStatus> {
  const supabase = createClient();

  try {
    const { error } = await supabase.from("schools").select("id").limit(1);

    if (error) {
      return { ok: false, message: "Supabase query failed." };
    }

    return { ok: true, message: "Supabase connected." };
  } catch (error) {
    console.error("[health] Supabase check failed", error);
    return { ok: false, message: "Supabase connection failed." };
  }
}

export default async function HealthPage() {
  const status = await checkSupabase();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Health Check
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Supabase Status
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Connection check for the backend services.
        </p>
      </header>

      <div
        className={`rounded-3xl border p-6 text-sm font-semibold shadow-sm ${
          status.ok
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-700"
        }`}
      >
        {status.message}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          Back to dashboard
        </Link>
        <Link
          href="/api/health"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
        >
          View JSON
        </Link>
      </div>
    </div>
  );
}
