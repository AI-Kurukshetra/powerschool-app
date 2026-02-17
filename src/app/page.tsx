import { getSchoolByName } from "@/server/schools/getSchoolByName";
import { selectSchoolFromForm } from "@/server/schools/selectSchool";

type PageProps = {
  searchParams?: {
    error?: string;
  };
};

function renderError(message: string) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

export default async function LandingPage({ searchParams }: PageProps) {
  const schoolResult = await getSchoolByName("Green Valley School");
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : null;

  if (schoolResult.error || !schoolResult.data) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <h1 className="text-3xl font-semibold text-slate-900">
          Select your school
        </h1>
        {renderError(schoolResult.error ?? "School record not found.")}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          PowerSchool Lite
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Select your school
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a school to continue to secure sign in.
        </p>
      </div>

      {errorMessage ? renderError(errorMessage) : null}

      <form
        action={selectSchoolFromForm}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Available School
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {schoolResult.data.name}
            </p>
          </div>
          <input type="hidden" name="school_id" value={schoolResult.data.id} />
          <button
            type="submit"
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Continue to login
          </button>
        </div>
      </form>
    </div>
  );
}
