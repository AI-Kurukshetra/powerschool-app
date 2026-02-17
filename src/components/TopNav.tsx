import Link from "next/link";

import { getViewerContext } from "@/server/auth/getViewerContext";
import { signOut } from "@/server/auth/signOut";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/students", label: "Students" },
  { href: "/dashboard/fees", label: "Fees" },
  { href: "/attendance", label: "Attendance" },
  { href: "/profile", label: "Profile" },
  { href: "/reports", label: "Reports" },
];

function getVisibleNavItems(role: "admin" | "teacher" | "parent"): NavItem[] {
  if (role === "parent") {
    return navItems.filter(
      (item) => item.href !== "/reports" && item.href !== "/dashboard/students",
    );
  }

  return navItems;
}

export default async function TopNav() {
  const viewerResult = await getViewerContext();
  const role = viewerResult.data?.role ?? "teacher";
  const visibleItems = getVisibleNavItems(role);

  return (
    <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold text-white">
            PS
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
              PowerSchool
            </p>
            <p className="text-sm font-semibold text-slate-900">School OS</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          {visibleItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
