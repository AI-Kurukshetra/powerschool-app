import { revalidatePath } from "next/cache";

import { createActionClient } from "@/lib/supabase/action";
import { getViewerContext } from "@/server/auth/getViewerContext";

type MarkAttendanceInput = {
  student_id: string;
  status: string;
};

type MarkAttendanceData = {
  id: string;
};

type MarkAttendanceResult =
  | { data: MarkAttendanceData; error: null }
  | { data: null; error: string };

const ALLOWED_STATUSES = ["present", "late", "absent"] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeInput(input: MarkAttendanceInput): MarkAttendanceInput {
  return {
    student_id: input.student_id.trim(),
    status: input.status.trim(),
  };
}

function normalizeStatus(value: string): AllowedStatus | null {
  const normalized = value.trim().toLowerCase();

  const match = ALLOWED_STATUSES.find((status) => status === normalized);

  return match ?? null;
}

export function validateMarkAttendanceInput(
  input: MarkAttendanceInput,
): MarkAttendanceInput | null {
  if (!isNonEmptyString(input.student_id)) {
    return null;
  }

  if (!isNonEmptyString(input.status)) {
    return null;
  }

  const normalized = normalizeInput(input);
  const status = normalizeStatus(normalized.status);

  if (!status) {
    return null;
  }

  return {
    student_id: normalized.student_id,
    status,
  };
}

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function markAttendance(
  input: MarkAttendanceInput,
): Promise<MarkAttendanceResult> {
  "use server";

  const payload = validateMarkAttendanceInput(input);

  if (!payload) {
    return { data: null, error: "Invalid attendance input." };
  }

  const supabase = createActionClient();
  const viewerResult = await getViewerContext();

  if (viewerResult.error || !viewerResult.data) {
    return { data: null, error: viewerResult.error ?? "Not authenticated." };
  }

  const { userId, role, schoolId } = viewerResult.data;

  if (role === "parent") {
    return { data: null, error: "You are not allowed to mark attendance." };
  }

  const { data, error } = await supabase
    .from("attendance")
    .insert({
      school_id: schoolId,
      student_id: payload.student_id,
      status: payload.status,
      date: getTodayIsoDate(),
      period: 1,
      recorded_by: userId,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    console.error("[attendance] Insert failed", error?.message ?? "No id");
    return { data: null, error: "Unable to record attendance." };
  }

  revalidatePath("/dashboard/students");

  return { data: { id: data.id }, error: null };
}
