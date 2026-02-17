import { createClient } from "@/lib/supabase/server";
import { getViewerContext } from "@/server/auth/getViewerContext";

type UserProfile = {
  fullName: string;
  role: string;
  schoolName: string;
};

type DashboardMetrics = {
  studentsCount: number;
  attendanceTotalCount: number;
  feesCollectedTotal: number;
  pendingFeesTotal: number;
};

type DashboardOverview = {
  profile: UserProfile;
  metrics: DashboardMetrics;
};

type DashboardResult =
  | { data: DashboardOverview; error: null }
  | { data: null; error: string };

type RawUserProfile = {
  full_name?: unknown;
  role?: unknown;
  school_id?: unknown;
  schools?:
    | {
        name?: unknown;
      }
    | {
        name?: unknown;
      }[]
    | null;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toSafeCount(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toSafeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

type FeeRow = {
  amount?: unknown;
  status?: unknown;
};

function computeFeeTotals(rows: FeeRow[]) {
  let feesCollectedTotal = 0;
  let pendingFeesTotal = 0;

  for (const fee of rows) {
    const amount = toSafeNumber(fee.amount);
    const status = typeof fee.status === "string" ? fee.status : "";

    if (status === "paid") {
      feesCollectedTotal += amount;
    } else if (status === "unpaid" || status === "partial" || status === "pending") {
      pendingFeesTotal += amount;
    }
  }

  return { feesCollectedTotal, pendingFeesTotal };
}
export function parseUserProfile(input: RawUserProfile | null): UserProfile | null {
  if (!input) {
    return null;
  }

  const fullName = isNonEmptyString(input.full_name)
    ? input.full_name.trim()
    : "User";

  if (!isNonEmptyString(input.role)) {
    return null;
  }

  if (!isNonEmptyString(input.school_id)) {
    return null;
  }

  const schoolRelation = Array.isArray(input.schools)
    ? input.schools[0]
    : input.schools ?? null;
  const schoolName = isNonEmptyString(schoolRelation?.name)
    ? schoolRelation?.name.trim()
    : "Unknown School";

  return {
    fullName,
    role: input.role.trim(),
    schoolName,
  };
}

export async function getDashboardOverview(): Promise<DashboardResult> {
  const supabase = createClient();
  const viewerResult = await getViewerContext();

  if (viewerResult.error || !viewerResult.data) {
    return { data: null, error: viewerResult.error ?? "Not authenticated." };
  }

  const { userId, role, schoolId } = viewerResult.data;

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("full_name, role, school_id, schools (name)")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("[dashboard] Failed to load profile", profileError.message);
    return { data: null, error: "Unable to load profile." };
  }

  let profile = parseUserProfile(profileData);

  if (!profile) {
    return {
      data: null,
      error:
        "We could not find your user profile. Please complete setup or contact an administrator.",
    };
  }

  if (profile.schoolName === "Unknown School") {
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("name")
      .eq("id", schoolId)
      .maybeSingle();

    if (schoolError) {
      console.error("[dashboard] Failed to load school name", schoolError.message);
    } else if (school && typeof school.name === "string" && school.name.trim()) {
      profile = { ...profile, schoolName: school.name.trim() };
    }
  }

  let studentIds: string[] | null = null;

  if (role === "parent") {
    const { data: guardians, error: guardiansError } = await supabase
      .from("guardians")
      .select("student_id")
      .eq("user_id", userId);

    if (guardiansError) {
      console.error(
        "[dashboard] Failed to load guardians",
        guardiansError.message,
      );
      return { data: null, error: "Unable to load dashboard data." };
    }

    studentIds = guardians
      ?.map((guardian) => guardian.student_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0) ?? [];
  }

  const studentsQuery = supabase
    .from("students")
    .select("id", { count: "exact", head: true });

  const attendanceQuery = supabase
    .from("attendance")
    .select("id", { count: "exact", head: true });

  let feesQuery = supabase.from("fees").select("amount, status, student_id");

  if (studentIds) {
    if (studentIds.length === 0) {
      return {
        data: {
          profile,
          metrics: {
            studentsCount: 0,
            attendanceTotalCount: 0,
            feesCollectedTotal: 0,
            pendingFeesTotal: 0,
          },
        },
        error: null,
      };
    }

    studentsQuery.in("id", studentIds);
    attendanceQuery.in("student_id", studentIds);
    feesQuery = feesQuery.in("student_id", studentIds);
  }

  const [{ count: studentsCount, error: studentsError }, attendance, fees] =
    await Promise.all([studentsQuery, attendanceQuery, feesQuery]);

  if (studentsError) {
    console.error("[dashboard] Failed to load students", studentsError.message);
  }

  if (attendance.error) {
    console.error(
      "[dashboard] Failed to load attendance",
      attendance.error.message,
    );
  }

  if (fees.error) {
    console.error("[dashboard] Failed to load fees", fees.error.message);
  }

  const feeRows = fees.data ?? [];
  const feeTotals = computeFeeTotals(feeRows);

  return {
    data: {
      profile,
      metrics: {
        studentsCount: toSafeCount(studentsCount),
        attendanceTotalCount: toSafeCount(attendance.count),
        feesCollectedTotal: feeTotals.feesCollectedTotal,
        pendingFeesTotal: feeTotals.pendingFeesTotal,
      },
    },
    error: null,
  };
}
