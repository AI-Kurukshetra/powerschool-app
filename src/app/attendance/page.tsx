import Link from "next/link";
import { redirect } from "next/navigation";

import TopNav from "@/components/TopNav";
import { markAttendance } from "@/server/attendance/markAttendance";
import { getAttendanceForToday } from "@/server/attendance/getAttendanceForToday";
import { getViewerContext } from "@/server/auth/getViewerContext";
import { getStudents } from "@/server/students/getStudents";

type AttendancePageProps = {
  searchParams?: {
    error?: string;
  };
};

const STATUS_OPTIONS = ["present", "late", "absent"] as const;

type AttendanceStatus = (typeof STATUS_OPTIONS)[number];

type StudentRow = {
  id: string;
  fullName: string;
  gradeLevel: string;
  studentCode: string;
  status?: AttendanceStatus;
};

function formatStatusLabel(status: AttendanceStatus | undefined): string {
  if (!status) {
    return "not recorded";
  }

  return status;
}

function getStatusBadgeClass(status: AttendanceStatus | undefined): string {
  if (status === "present") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "late") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "absent") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-600";
}

function toErrorParam(message: string): string {
  return encodeURIComponent(message);
}

async function handleMarkAttendance(formData: FormData): Promise<void> {
  "use server";

  const studentId = formData.get("student_id");
  const status = formData.get("status");

  if (typeof studentId !== "string" || typeof status !== "string") {
    redirect(`/attendance?error=${toErrorParam("Invalid attendance input.")}`);
  }

  const result = await markAttendance({
    student_id: studentId,
    status,
  });

  if (result.error) {
    redirect(`/attendance?error=${toErrorParam(result.error)}`);
  }

  redirect("/attendance");
}

function renderEmptyState(message: string) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
      {message}
    </div>
  );
}

export default async function AttendancePage({
  searchParams,
}: AttendancePageProps) {
  const viewerResult = await getViewerContext();
  const role = viewerResult.data?.role ?? "teacher";
  const [studentsResult, attendanceResult] = await Promise.all([
    getStudents(),
    getAttendanceForToday(),
  ]);

  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : null;

  if (studentsResult.error) {
    return (
      <div className="space-y-6">
        <TopNav />
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Attendance
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Daily Check-in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track and update attendance across today's roster.
          </p>
        </header>
        {renderEmptyState(studentsResult.error)}
      </div>
    );
  }

  const attendanceMap = attendanceResult.data ?? {};

  const studentData = studentsResult.data ?? [];

  const rows: StudentRow[] = studentData.map((student) => ({
    id: student.id,
    fullName: student.fullName,
    gradeLevel: student.gradeLevel,
    studentCode: student.studentCode,
    status: attendanceMap[student.id]?.status,
  }));

  return (
    <div className="space-y-6">
      <TopNav />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Attendance
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Daily Check-in</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track and update attendance across today's roster.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      {errorMessage ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {rows.length === 0 ? (
        renderEmptyState("No students available for attendance today.")
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Grade</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="text-slate-700">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {row.fullName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {row.studentCode}
                      </div>
                    </td>
                    <td className="px-6 py-4">{row.gradeLevel}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          row.status,
                        )}`}
                      >
                        {formatStatusLabel(row.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {role === "parent" ? (
                        <span className="text-xs text-slate-500">
                          View only
                        </span>
                      ) : (
                        <form action={handleMarkAttendance}>
                          <input
                            type="hidden"
                            name="student_id"
                            value={row.id}
                          />
                          <div className="flex flex-wrap items-center gap-3">
                            <select
                              name="status"
                              defaultValue={row.status ?? "present"}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
