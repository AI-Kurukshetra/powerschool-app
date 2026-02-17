const headers = ["Student", "Grade", "Student Code", "Status", "Action"];

export default function AttendanceLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-8 w-52 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-80 animate-pulse rounded-full bg-slate-200" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-6 py-4">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[0, 1, 2, 3, 4].map((row) => (
                <tr key={row}>
                  {headers.map((cell) => (
                    <td key={cell} className="px-6 py-4">
                      <div className="h-4 w-full max-w-[160px] animate-pulse rounded-full bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
