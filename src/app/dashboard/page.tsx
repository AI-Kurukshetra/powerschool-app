import TopNav from "@/components/TopNav";
import { formatCurrencyUSD } from "@/lib/format";
import { getDashboardOverview } from "@/server/dashboard/getDashboardOverview";

type MetricCard = {
  label: string;
  value: string;
};

function renderProfile(fullName: string, role: string, schoolName: string) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Profile
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {fullName}
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">Role</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{role}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">School</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {schoolName}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">Status</p>
          <p className="mt-2 text-sm font-semibold text-emerald-600">Active</p>
        </div>
      </div>
    </div>
  );
}

function renderMetrics(metrics: MetricCard[]) {
  const gridClass =
    metrics.length > 3 ? "grid gap-4 md:grid-cols-4" : "grid gap-4 md:grid-cols-3";

  return (
    <div className={gridClass}>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs text-slate-500">{metric.label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function renderError(message: string) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
      {message}
    </div>
  );
}

export default async function DashboardPage() {
  const result = await getDashboardOverview();

  if (result.error || !result.data) {
    return (
      <div className="space-y-6">
        <TopNav />
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Staff Overview
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Secure profile details pulled from Supabase.
          </p>
        </header>
        {renderError(result.error ?? "Unable to load dashboard data.")}
      </div>
    );
  }

  const metrics: MetricCard[] =
    result.data.profile.role === "admin"
      ? [
          {
            label: "Total Students",
            value: result.data.metrics.studentsCount.toString(),
          },
          {
            label: "Total Attendance",
            value: result.data.metrics.attendanceTotalCount.toString(),
          },
          {
            label: "Fees Collected",
            value: formatCurrencyUSD(result.data.metrics.feesCollectedTotal),
          },
          {
            label: "Pending Fees",
            value: formatCurrencyUSD(result.data.metrics.pendingFeesTotal),
          },
        ]
      : [
          {
            label: "Students",
            value: result.data.metrics.studentsCount.toString(),
          },
          {
            label: "Attendance Records",
            value: result.data.metrics.attendanceTotalCount.toString(),
          },
          {
            label: "Pending Fees",
            value: formatCurrencyUSD(result.data.metrics.pendingFeesTotal),
          },
        ];

  return (
    <div className="space-y-6">
      <TopNav />
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Staff Overview
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Secure profile details pulled from Supabase.
        </p>
      </header>

      {renderProfile(
        result.data.profile.fullName,
        result.data.profile.role,
        result.data.profile.schoolName,
      )}

      {renderMetrics(metrics)}
    </div>
  );
}
