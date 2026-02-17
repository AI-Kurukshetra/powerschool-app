# PowerSchool Lite (MVP)

Role-based school operations dashboard built with Next.js + Supabase. This MVP focuses on secure access, core student operations, attendance tracking, and fee management for Admin, Teacher, and Parent/Student roles.

**MVP Features (Implemented)**
- Role-based authentication with Supabase and protected routes.
- Admin data-oriented dashboard widgets:
  - Total students
  - Total attendance records
  - Fees collected (sum of paid)
  - Pending fees (sum of unpaid/partial/pending)
- Students directory for permitted roles.
- Attendance tracking and daily status updates.
- Fees ledger with status and due dates.
- Fee status updates (mark as paid) for Admin and Parent.
- Reports dashboard (not available for Parent).
- Profile update page for name, phone, and address.

**Roles & Access**
- **Admin**: Full data visibility, fee status updates, reports access.
- **Teacher**: Operational visibility for students, attendance, and fees.
- **Parent/Student**: Scoped visibility only for linked students (via guardians).

**Key Routes**
- `/` School selection
- `/login` Authentication
- `/dashboard` Main dashboard + widgets
- `/dashboard/students` Students directory (Admin/Teacher)
- `/dashboard/fees` Fees ledger (Admin/Parent can mark paid)
- `/attendance` Attendance tracking
- `/reports` Reports dashboard (Admin/Teacher)
- `/profile` Profile update

**Tech Stack**
- Next.js App Router
- Supabase (Auth + Postgres)
- Tailwind CSS

**Local Development**
```bash
npm install
npm run dev
```

**Getting Started (Next.js)**
- Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
- Open `http://localhost:3000` in your browser.
- Edit `src/app/page.tsx` to start customizing the landing page.
- This project uses `next/font` to load the Geist font automatically.

**Learn More**
- Next.js Documentation: https://nextjs.org/docs
- Learn Next.js: https://nextjs.org/learn
- Next.js GitHub: https://github.com/vercel/next.js

**Deploy on Vercel**
- Vercel deployment guide: https://nextjs.org/docs/app/building-your-application/deploying

**Required Environment Variables**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Database schema and RLS policies live in `database/migrations`.

---

## Next Steps (SaaS Enhancements)
These are the planned SaaS-grade improvements on top of the MVP:

- **Multi-tenant orgs**: School onboarding, tenant isolation, per-school branding.
- **Billing & plans**: Subscription tiers, usage limits, and automated invoicing.
- **Advanced fees**: Partial payments, payment methods, receipts, and refund flows.
- **Messaging & notifications**: SMS/email alerts for attendance, fees, and announcements.
- **Analytics**: Cohort trends, attendance insights, fee collection forecasting.
- **RBAC expansion**: Fine-grained permissions and custom roles.
- **Audit trail**: Who changed what and when across records.
- **Data import/export**: CSV sync for students, fees, and attendance.
- **Mobile-ready UX**: Parent/student app experience and push notifications.
