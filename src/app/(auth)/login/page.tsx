import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { signIn } from "@/server/auth/signIn";

type LoginPageProps = {
  searchParams?: {
    error?: string;
  };
};

function normalizeEmail(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizePassword(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function toErrorParam(message: string): string {
  return encodeURIComponent(message);
}

async function handleSignIn(formData: FormData): Promise<void> {
  "use server";

  const email = normalizeEmail(formData.get("email"));
  const password = normalizePassword(formData.get("password"));
  const schoolId =
    typeof formData.get("school_id") === "string"
      ? String(formData.get("school_id")).trim()
      : "";

  const errorMessage = await signIn({ email, password, school_id: schoolId });

  if (errorMessage) {
    redirect(`/login?error=${toErrorParam(errorMessage)}`);
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : null;

  const cookieStore = cookies();
  const schoolName = cookieStore.get("school_name")?.value ?? "";
  const schoolId = cookieStore.get("school_id")?.value ?? "";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            PowerSchool Lite
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your dashboard and student records.
          </p>
          {schoolName ? (
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              {schoolName}
            </p>
          ) : null}
        </header>

        <form
          action={handleSignIn}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-5">
            <input type="hidden" name="school_id" value={schoolId} />
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="you@school.edu"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
              />
            </label>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Sign in
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Need help? Contact your system administrator.
        </div>
      </div>
    </div>
  );
}
