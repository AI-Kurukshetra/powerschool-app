import { redirect } from "next/navigation";

import TopNav from "@/components/TopNav";
import { getProfile } from "@/server/profile/getProfile";
import { updateProfile } from "@/server/profile/updateProfile";

type ProfilePageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

function toParam(message: string): string {
  return encodeURIComponent(message);
}

async function handleUpdateProfile(formData: FormData): Promise<void> {
  "use server";

  const fullName = formData.get("full_name");
  const phone = formData.get("phone");
  const address = formData.get("address");

  if (
    typeof fullName !== "string" ||
    typeof phone !== "string" ||
    typeof address !== "string"
  ) {
    redirect(`/profile?error=${toParam("Invalid profile input.")}`);
  }

  const result = await updateProfile({
    full_name: fullName,
    phone,
    address,
  });

  if (result.error) {
    redirect(`/profile?error=${toParam(result.error)}`);
  }

  redirect("/profile?success=1");
}

function renderBanner(message: string, tone: "error" | "success") {
  const classes =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${classes}`}>
      {message}
    </div>
  );
}

function renderError(message: string) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
      {message}
    </div>
  );
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const profileResult = await getProfile();

  if (profileResult.error || !profileResult.data) {
    return (
      <div className="space-y-6">
        <TopNav />
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Profile
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Update Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep your contact details up to date.
          </p>
        </header>
        {renderError(profileResult.error ?? "Unable to load profile.")}
      </div>
    );
  }

  const { fullName, phone, address, role } = profileResult.data;
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : null;
  const successMessage = searchParams?.success
    ? "Profile updated successfully."
    : null;

  return (
    <div className="space-y-6">
      <TopNav />
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Update Profile
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your personal details and contact information.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">Role</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{role}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">Status</p>
          <p className="mt-2 text-sm font-semibold text-emerald-600">Active</p>
        </div>
      </div>

      {errorMessage ? renderBanner(errorMessage, "error") : null}
      {successMessage ? renderBanner(successMessage, "success") : null}

      <form
        action={handleUpdateProfile}
        className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-2">
          <label htmlFor="full_name" className="text-sm font-semibold text-slate-700">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            defaultValue={fullName}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="address" className="text-sm font-semibold text-slate-700">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={4}
            defaultValue={address}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
