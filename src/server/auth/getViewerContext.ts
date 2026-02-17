import { createClient } from "@/lib/supabase/server";

type ViewerContext = {
  userId: string;
  role: "admin" | "teacher" | "parent";
  schoolId: string;
};

type ViewerResult =
  | { data: ViewerContext; error: null }
  | { data: null; error: string };

type RawUser = {
  id?: unknown;
  role?: unknown;
  school_id?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseViewerContext(user: RawUser | null): ViewerContext | null {
  if (!user) {
    return null;
  }

  if (!isNonEmptyString(user.id)) {
    return null;
  }

  if (!isNonEmptyString(user.role)) {
    return null;
  }

  if (!isNonEmptyString(user.school_id)) {
    return null;
  }

  if (user.role !== "admin" && user.role !== "teacher" && user.role !== "parent") {
    return null;
  }

  return {
    userId: user.id.trim(),
    role: user.role,
    schoolId: user.school_id.trim(),
  };
}

export async function getViewerContext(): Promise<ViewerResult> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    console.warn("[auth] Missing authenticated user");
    return { data: null, error: "Not authenticated." };
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, role, school_id")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error) {
    console.error("[auth] Failed to load user context", error.message);
    return { data: null, error: "Unable to load user profile." };
  }

  const context = parseViewerContext(data);

  if (!context) {
    return { data: null, error: "Invalid user profile." };
  }

  return { data: context, error: null };
}
