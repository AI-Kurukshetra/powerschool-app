import TopNav from "@/components/TopNav";
import { getStudents } from "@/server/students/getStudents";

type Column = {
  key: "student_code" | "full_name" | "grade_level" | "status";
  label: string;
};

const columns: Column[] = [
  { key: "student_code", label: "Student Code" },
  { key: "full_name", label: "Full Name" },
  { key: "grade_level", label: "Grade Level" },
  { key: "status", label: "Status" },
];

type Row = {
  student_code: string;
  full_name: string;
  grade_level: string;
  status: string;
};

function renderTable(rows: Row[]) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-4 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.student_code} className="text-slate-700">
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {row.student_code}
                </td>
                <td className="px-6 py-4">{row.full_name}</td>
                <td className="px-6 py-4">{row.grade_level}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      row.status.toLowerCase() === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderEmptyState(message: string) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
      {message}
    </div>
  );
}

export default async function DashboardStudentsPage() {
  const result = await getStudents();

  if (result.error || !result.data) {
    return (
      <div className="space-y-6">
        <TopNav />
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Students
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Student Directory
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Review active student records visible to your role.
          </p>
        </header>
        {renderEmptyState(result.error ?? "Unable to load students.")}
      </div>
    );
  }

  const rows: Row[] = result.data.map((student) => ({
    student_code: student.studentCode,
    full_name: student.fullName,
    grade_level: student.gradeLevel,
    status: student.status,
  }));

  return (
    <div className="space-y-6">
      <TopNav />
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Students
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Student Directory
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Review active student records visible to your role.
        </p>
      </header>
      {rows.length > 0
        ? renderTable(rows)
        : renderEmptyState("No students found for your account.")}
    </div>
  );
}
