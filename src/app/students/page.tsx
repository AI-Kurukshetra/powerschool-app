import Link from "next/link";

import TopNav from "@/components/TopNav";
const students = [
  { name: "Ava Thompson", grade: "7", status: "Active" },
  { name: "Noah Martinez", grade: "9", status: "Active" },
  { name: "Liam Patel", grade: "6", status: "Inactive" },
  { name: "Mia Chen", grade: "8", status: "Active" },
  { name: "Ethan Brooks", grade: "10", status: "Active" },
];

export default function StudentsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <TopNav />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Students
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Student Directory</h1>
            <p className="mt-2 text-sm text-slate-600">
              Search, review, and manage active student records.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Back to overview
            </Link>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Add student
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Roster</h2>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              1,248 students
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {students.map((student) => (
              <div
                key={student.name}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {student.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Grade {student.grade} - {student.status}
                  </p>
                </div>
                <button className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300">
                  View profile
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
