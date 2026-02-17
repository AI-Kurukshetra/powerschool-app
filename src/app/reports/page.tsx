import Link from "next/link";

import TopNav from "@/components/TopNav";
import { formatCurrencyUSD } from "@/lib/format";
import { getViewerContext } from "@/server/auth/getViewerContext";
import { getReportsSummary } from "@/server/reports/getReportsSummary";

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function renderEmptyState(message: string) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
      {message}
    </div>
  );
}

export default async function ReportsPage() {
  const viewerResult = await getViewerContext();

  if (viewerResult.data?.role === "parent") {
    return (
      <div className="space-y-6">
        <TopNav />
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Reports
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Reports Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              Reports are not available for parent accounts.
            </p>
          </div>
        </header>
        {renderEmptyState("Reports are not available for parent accounts.")}
      </div>
    );
  }

  const result = await getReportsSummary();

  if (result.error || !result.data) {
    return (
      <div className="space-y-6">
        <TopNav />
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Reports
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Reports Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              Track attendance and fee performance in one place.
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
        {renderEmptyState(result.error ?? "Unable to load reports.")}
      </div>
    );
  }

  const reportCards = [
    {
      title: "Daily Attendance",
      value: formatPercent(result.data.attendanceRateToday),
      detail: `${result.data.attendanceRecordedToday} records today`,
    },
    {
      title: "Fee Collection Rate",
      value: formatPercent(result.data.feeCollectionRate),
      detail: `${result.data.totalFeeCount} total fees`,
    },
    {
      title: "Outstanding Balances",
      value: formatCurrencyUSD(result.data.pendingFeeTotal),
      detail: `${result.data.pendingFeeCount} pending fees`,
    },
  ];

  return (
    <div className="space-y-6">
      <TopNav />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Reports
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Reports Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track attendance and fee performance in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            Back to dashboard
          </Link>
          <button className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
            Export snapshot
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {reportCards.map((report) => (
          <div
            key={report.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {report.title}
            </p>
            <p className="mt-4 text-2xl font-semibold text-slate-900">
              {report.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{report.detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Insights</h2>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            Live view
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">
              Attendance Completion
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {formatPercent(result.data.attendanceRateToday)} of recorded
              check-ins are present today.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">
              Fee Follow-up
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {result.data.pendingFeeCount} pending fees totaling{" "}
              {formatCurrencyUSD(result.data.pendingFeeTotal)}.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">
              Collections Progress
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {formatPercent(result.data.feeCollectionRate)} of fees marked paid.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
