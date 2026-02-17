import { createClient } from "@/lib/supabase/server";

type ReportsSummary = {
  attendanceRateToday: number;
  attendanceRecordedToday: number;
  pendingFeeTotal: number;
  feeCollectionRate: number;
  pendingFeeCount: number;
  totalFeeCount: number;
};

type ReportsResult =
  | { data: ReportsSummary; error: null }
  | { data: null; error: string };

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function toSafeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

type FeeRow = {
  amount?: unknown;
  status?: unknown;
};

export function computeAttendanceRate(
  totalAttendance: number,
  presentAttendance: number,
): number {
  return totalAttendance > 0 ? presentAttendance / totalAttendance : 0;
}

export function computeFeeMetrics(rows: FeeRow[]): {
  pendingFeeTotal: number;
  pendingFeeCount: number;
  paidFeeCount: number;
  totalFeeCount: number;
  feeCollectionRate: number;
} {
  let pendingFeeTotal = 0;
  let pendingFeeCount = 0;
  let paidFeeCount = 0;

  for (const fee of rows) {
    const amount = toSafeNumber(fee.amount);
    const status = typeof fee.status === "string" ? fee.status : "";

    if (status === "pending") {
      pendingFeeTotal += amount;
      pendingFeeCount += 1;
    }

    if (status === "paid") {
      paidFeeCount += 1;
    }
  }

  const totalFeeCount = rows.length;
  const feeCollectionRate =
    totalFeeCount > 0 ? paidFeeCount / totalFeeCount : 0;

  return {
    pendingFeeTotal,
    pendingFeeCount,
    paidFeeCount,
    totalFeeCount,
    feeCollectionRate,
  };
}

export async function getReportsSummary(): Promise<ReportsResult> {
  const supabase = createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    console.warn("[reports] Missing authenticated user");
    return { data: null, error: "Not authenticated." };
  }

  const today = getTodayIsoDate();

  const [attendanceTotal, attendancePresent, fees] = await Promise.all([
    supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("date", today),
    supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("date", today)
      .eq("status", "present"),
    supabase.from("fees").select("amount, status"),
  ]);

  if (attendanceTotal.error) {
    console.error(
      "[reports] Failed to load attendance totals",
      attendanceTotal.error.message,
    );
  }

  if (attendancePresent.error) {
    console.error(
      "[reports] Failed to load attendance present",
      attendancePresent.error.message,
    );
  }

  if (fees.error) {
    console.error("[reports] Failed to load fees", fees.error.message);
  }

  const totalAttendance = toSafeNumber(attendanceTotal.count);
  const presentAttendance = toSafeNumber(attendancePresent.count);
  const attendanceRate = computeAttendanceRate(
    totalAttendance,
    presentAttendance,
  );

  const feeRows = fees.data ?? [];
  const feeMetrics = computeFeeMetrics(feeRows);

  return {
    data: {
      attendanceRateToday: attendanceRate,
      attendanceRecordedToday: totalAttendance,
      pendingFeeTotal: feeMetrics.pendingFeeTotal,
      feeCollectionRate: feeMetrics.feeCollectionRate,
      pendingFeeCount: feeMetrics.pendingFeeCount,
      totalFeeCount: feeMetrics.totalFeeCount,
    },
    error: null,
  };
}
