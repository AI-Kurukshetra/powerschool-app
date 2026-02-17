import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "@/server/auth/getViewerContext";

type AttendanceStatus = "present" | "late" | "absent";

type AttendanceRow = {
  student_id?: unknown;
  status?: unknown;
  recorded_at?: unknown;
};

type AttendanceEntry = {
  status: AttendanceStatus;
  recordedAt: string;
};

export type AttendanceMap = Record<string, AttendanceEntry>;

type AttendanceResult =
  | { data: AttendanceMap; error: null }
  | { data: null; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidStatus(value: unknown): value is AttendanceStatus {
  return value === "present" || value === "late" || value === "absent";
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function parseAttendanceRows(
  rows: AttendanceRow[],
): AttendanceMap | null {
  const map: AttendanceMap = {};

  for (const row of rows) {
    if (!isNonEmptyString(row.student_id)) {
      return null;
    }

    if (!isValidStatus(row.status)) {
      return null;
    }

    const recordedAt = isNonEmptyString(row.recorded_at)
      ? row.recorded_at
      : new Date().toISOString();

    if (!map[row.student_id] || map[row.student_id].recordedAt < recordedAt) {
      map[row.student_id] = { status: row.status, recordedAt };
    }
  }

  return map;
}

export async function getAttendanceForToday(): Promise<AttendanceResult> {
  const supabase = createClient();
  const viewerResult = await getViewerContext();

  if (viewerResult.error || !viewerResult.data) {
    return { data: null, error: viewerResult.error ?? "Not authenticated." };
  }

  const { userId, role } = viewerResult.data;

  let query = supabase
    .from("attendance")
    .select("student_id, status, recorded_at")
    .eq("date", getTodayIsoDate())
    .order("recorded_at", { ascending: false });

  if (role === "parent") {
    const { data: guardians, error: guardiansError } = await supabase
      .from("guardians")
      .select("student_id")
      .eq("user_id", userId);

    if (guardiansError) {
      console.error(
        "[attendance] Failed to load guardians",
        guardiansError.message,
      );
      return { data: null, error: "Unable to load attendance." };
    }

    const studentIds = guardians
      ?.map((guardian) => guardian.student_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (!studentIds || studentIds.length === 0) {
      return { data: {}, error: null };
    }

    query = query.in("student_id", studentIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[attendance] Query failed", error.message);
    return { data: null, error: "Unable to load attendance." };
  }

  if (!data) {
    return { data: {}, error: null };
  }

  const map = parseAttendanceRows(data);

  if (!map) {
    return { data: null, error: "Invalid attendance data." };
  }

  return { data: map, error: null };
}
