import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "@/server/auth/getViewerContext";

type Profile = {
  fullName: string;
  phone: string;
  address: string;
  role: "admin" | "teacher" | "parent";
};

type ProfileResult = { data: Profile; error: null } | { data: null; error: string };

type RawProfile = {
  full_name?: unknown;
  phone?: unknown;
  address?: unknown;
  role?: unknown;
};

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseRole(value: unknown): Profile["role"] | null {
  const role = toTrimmedString(value);
  if (role === "admin" || role === "teacher" || role === "parent") {
    return role;
  }
  return null;
}

function parseProfile(input: RawProfile | null): Profile | null {
  if (!input) {
    return null;
  }

  const role = parseRole(input.role);

  if (!role) {
    return null;
  }

  return {
    fullName: toTrimmedString(input.full_name),
    phone: toTrimmedString(input.phone),
    address: toTrimmedString(input.address),
    role,
  };
}

export async function getProfile(): Promise<ProfileResult> {
  const supabase = createClient();
  const viewerResult = await getViewerContext();

  if (viewerResult.error || !viewerResult.data) {
    return { data: null, error: viewerResult.error ?? "Not authenticated." };
  }

  const { userId } = viewerResult.data;

  const { data, error } = await supabase
    .from("users")
    .select("full_name, phone, address, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[profile] Failed to load profile", error.message);
    return { data: null, error: "Unable to load profile." };
  }

  const profile = parseProfile(data);

  if (!profile) {
    return { data: null, error: "Profile record not found." };
  }

  return { data: profile, error: null };
}
