import TopNav from "@/components/TopNav";
import { formatCurrencyUSD, formatDateUS } from "@/lib/format";
import { markFeePaidFromForm } from "@/server/fees/markFeePaid";
import { getViewerContext } from "@/server/auth/getViewerContext";
import { getFees } from "@/server/fees/getFees";

const columns = [
  { key: "student", label: "Student" },
  { key: "fee_type", label: "Fee Type" },
  { key: "amount", label: "Amount" },
  { key: "due_date", label: "Due Date" },
  { key: "status", label: "Status" },
] as const;

type Row = {
  fee_id: string;
  student: string;
  fee_type: string;
  amount: string;
  due_date: string;
  status: string;
};

type FeesTableProps = {
  rows: Row[];
  canMarkPaid: boolean;
};

function renderTable({ rows, canMarkPaid }: FeesTableProps) {
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
              {canMarkPaid ? (
                <th className="px-6 py-4 font-semibold">Action</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={`${row.student}-${row.fee_type}-${row.due_date}`}>
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {row.student}
                </td>
                <td className="px-6 py-4 text-slate-700">{row.fee_type}</td>
                <td className="px-6 py-4 text-slate-700">{row.amount}</td>
                <td className="px-6 py-4 text-slate-700">{row.due_date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      row.status.toLowerCase() === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : row.status.toLowerCase() === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                {canMarkPaid ? (
                  <td className="px-6 py-4">
                    {row.status.toLowerCase() === "pending" ? (
                      <form action={markFeePaidFromForm}>
                        <input type="hidden" name="fee_id" value={row.fee_id} />
                        <button
                          type="submit"
                          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                          Mark paid
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-500">No action</span>
                    )}
                  </td>
                ) : null}
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

export default async function DashboardFeesPage() {
  const viewerResult = await getViewerContext();
  const role = viewerResult.data?.role ?? "teacher";
  const result = await getFees();

  if (result.error || !result.data) {
    return (
      <div className="space-y-6">
        <TopNav />
        <header>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Fees
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Fee Ledger
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track balances and upcoming due dates for visible students.
          </p>
        </header>
        {renderEmptyState(result.error ?? "Unable to load fees.")}
      </div>
    );
  }

  const rows: Row[] = result.data.map((fee) => ({
    fee_id: fee.id,
    student: fee.studentName,
    fee_type: fee.feeType,
    amount: formatCurrencyUSD(fee.amount),
    due_date: formatDateUS(fee.dueDate),
    status: fee.status,
  }));

  return (
    <div className="space-y-6">
      <TopNav />
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Fees
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Fee Ledger
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Track balances and upcoming due dates for visible students.
        </p>
      </header>
      {rows.length > 0
        ? renderTable({ rows, canMarkPaid: role === "parent" || role === "admin" })
        : renderEmptyState("No fees found for your account.")}
    </div>
  );
}
