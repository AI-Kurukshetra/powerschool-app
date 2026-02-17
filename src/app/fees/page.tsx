import Link from "next/link";

import TopNav from "@/components/TopNav";
const feeRows = [
  { student: "Sophia Rivera", balance: "$120.00", due: "Feb 28" },
  { student: "Ethan Brooks", balance: "$45.00", due: "Mar 05" },
  { student: "Mia Chen", balance: "$260.00", due: "Mar 12" },
  { student: "Lucas Nguyen", balance: "$80.00", due: "Mar 18" },
];

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <TopNav />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Fees
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Fee Ledger</h1>
            <p className="mt-2 text-sm text-slate-600">
              Monitor balances, due dates, and recent payments.
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
              Record payment
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Outstanding balance</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              $48,320
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Collected this month</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-600">
              $18,420
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Past due</p>
            <p className="mt-3 text-2xl font-semibold text-rose-600">86</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Balances to Review</h2>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
              Term 2
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {feeRows.map((row) => (
              <div
                key={row.student}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {row.student}
                  </p>
                  <p className="text-xs text-slate-500">Due {row.due}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {row.balance}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
