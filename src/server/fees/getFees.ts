import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "@/server/auth/getViewerContext";

type Fee = {
  id: string;
  studentId: string;
  studentName: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: string;
  schoolId: string;
};

type RawFee = {
  id?: unknown;
  student_id?: unknown;
  fee_type?: unknown;
  amount?: unknown;
  due_date?: unknown;
  status?: unknown;
  school_id?: unknown;
  students?: {
    full_name?: unknown;
  }[] | null;
};

type FeesResult =
  | { data: Fee[]; error: null }
  | { data: null; error: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function parseFee(input: RawFee | null): Fee | null {
  if (!input) {
    return null;
  }

  if (!isNonEmptyString(input.id)) {
    return null;
  }

  if (!isNonEmptyString(input.student_id)) {
    return null;
  }

  if (!isNonEmptyString(input.fee_type)) {
    return null;
  }

  const amount = toNumber(input.amount);

  if (amount === null) {
    return null;
  }

  if (!isNonEmptyString(input.due_date)) {
    return null;
  }

  if (!isNonEmptyString(input.status)) {
    return null;
  }

  if (!isNonEmptyString(input.school_id)) {
    return null;
  }

  const studentName = isNonEmptyString(input.students?.[0]?.full_name)
    ? input.students?.[0]?.full_name.trim()
    : "";

  return {
    id: input.id.trim(),
    studentId: input.student_id.trim(),
    studentName,
    feeType: input.fee_type.trim(),
    amount,
    dueDate: input.due_date.trim(),
    status: input.status.trim(),
    schoolId: input.school_id.trim(),
  };
}

function parseFees(rows: RawFee[]): FeesResult {
  const fees: Fee[] = [];

  for (const row of rows) {
    const fee = parseFee(row);

    if (!fee) {
      return { data: null, error: "Invalid fee record returned." };
    }

    fees.push(fee);
  }

  return { data: fees, error: null };
}

export async function getFees(): Promise<FeesResult> {
  const supabase = createClient();
  const viewerResult = await getViewerContext();

  if (viewerResult.error || !viewerResult.data) {
    return { data: null, error: viewerResult.error ?? "Not authenticated." };
  }

  const { userId, role } = viewerResult.data;

  console.info("[fees] Fetching fees", { userId, role });

  let query = supabase
    .from("fees")
    .select(
      "id, student_id, fee_type, amount, due_date, status, school_id, students (full_name)",
    )
    .order("due_date", { ascending: true });

  if (role === "parent") {
    const { data: guardians, error: guardiansError } = await supabase
      .from("guardians")
      .select("student_id")
      .eq("user_id", userId);

    if (guardiansError) {
      console.error("[fees] Failed to load guardians", guardiansError.message);
      return { data: null, error: "Unable to load fees." };
    }

    const studentIds = guardians
      ?.map((guardian) => guardian.student_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (!studentIds || studentIds.length === 0) {
      return { data: [], error: null };
    }

    query = query.in("student_id", studentIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[fees] Query failed", error.message);
    return { data: null, error: "Unable to load fees." };
  }

  if (!data) {
    return { data: [], error: null };
  }

  const parsed = parseFees(data);

  if (parsed.error || !parsed.data) {
    return parsed;
  }

  const missingStudentIds = parsed.data
    .filter((fee) => !fee.studentName)
    .map((fee) => fee.studentId);

  if (missingStudentIds.length === 0) {
    return parsed;
  }

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, full_name")
    .in("id", missingStudentIds);

  if (studentsError) {
    console.error("[fees] Failed to load student names", studentsError.message);
    return parsed;
  }

  const studentNameMap = new Map<string, string>();
  for (const student of students ?? []) {
    if (isNonEmptyString(student?.id) && isNonEmptyString(student?.full_name)) {
      studentNameMap.set(student.id, student.full_name.trim());
    }
  }

  const enriched = parsed.data.map((fee) => ({
    ...fee,
    studentName: fee.studentName || studentNameMap.get(fee.studentId) || "Unknown Student",
  }));

  return { data: enriched, error: null };
}
