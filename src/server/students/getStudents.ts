import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "@/server/auth/getViewerContext";

type Student = {
  id: string;
  fullName: string;
  studentCode: string;
  gradeLevel: string;
  status: string;
  schoolId: string;
};

type RawStudent = {
  id?: unknown;
  full_name?: unknown;
  student_code?: unknown;
  grade_level?: unknown;
  status?: unknown;
  school_id?: unknown;
};

type StudentsResult =
  | { data: Student[]; error: null }
  | { data: null; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseStudent(input: RawStudent | null): Student | null {
  if (!input) {
    return null;
  }

  if (!isNonEmptyString(input.id)) {
    return null;
  }

  if (!isNonEmptyString(input.full_name)) {
    return null;
  }

  if (!isNonEmptyString(input.student_code)) {
    return null;
  }

  if (!isNonEmptyString(input.grade_level)) {
    return null;
  }

  if (!isNonEmptyString(input.status)) {
    return null;
  }

  if (!isNonEmptyString(input.school_id)) {
    return null;
  }

  return {
    id: input.id.trim(),
    fullName: input.full_name.trim(),
    studentCode: input.student_code.trim(),
    gradeLevel: input.grade_level.trim(),
    status: input.status.trim(),
    schoolId: input.school_id.trim(),
  };
}

function parseStudents(rows: RawStudent[]): StudentsResult {
  const students: Student[] = [];

  for (const row of rows) {
    const student = parseStudent(row);

    if (!student) {
      return { data: null, error: "Invalid student record returned." };
    }

    students.push(student);
  }

  return { data: students, error: null };
}

export async function getStudents(): Promise<StudentsResult> {
  const supabase = createClient();
  const viewerResult = await getViewerContext();

  if (viewerResult.error || !viewerResult.data) {
    return { data: null, error: viewerResult.error ?? "Not authenticated." };
  }

  const { userId, role } = viewerResult.data;

  console.info("[students] Fetching students", { userId, role });

  let query = supabase
    .from("students")
    .select("id, full_name, student_code, grade_level, status, school_id")
    .order("full_name");

  if (role === "parent") {
    const { data: guardians, error: guardiansError } = await supabase
      .from("guardians")
      .select("student_id")
      .eq("user_id", userId);

    if (guardiansError) {
      console.error("[students] Failed to load guardians", guardiansError.message);
      return { data: null, error: "Unable to load student records." };
    }

    const studentIds = guardians
      ?.map((guardian) => guardian.student_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (!studentIds || studentIds.length === 0) {
      return { data: [], error: null };
    }

    query = query.in("id", studentIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[students] Query failed", error.message);
    return { data: null, error: "Unable to load students." };
  }

  if (!data) {
    return { data: [], error: null };
  }

  return parseStudents(data);
}
