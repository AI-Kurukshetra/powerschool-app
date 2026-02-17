**PowerSchool Lite — Technical Architecture (Hackathon Vertical Slice)**

**Purpose**
Design a complete technical architecture for a convincing SaaS vertical slice focused on Authentication, Student Management, Attendance Tracking, Fee Tracking, and Reports Dashboard using Next.js (App Router + Server Actions), Supabase, and Vercel. This document is architecture-only; no application code.

**Assumptions**
- Single product with multi-school support.
- Roles: Admin, Teacher, Parent/Student.
- Teachers are assigned to students (directly or via enrollment).
- Parents are linked to students via guardianship.
- Reports are aggregate, read-only views built on existing data.

**Tech Stack**
- Frontend: Next.js (App Router), Server Components by default, Client Components only for interactive UI.
- Backend: Supabase (Postgres, Auth, RLS, Storage if needed).
- Hosting: Vercel.
- AI-assisted development: Codex for scaffolding, schema drafts, and policy outlines.

**MVP Feature List (Implemented)**
- Role-based authentication and protected routes (Admin, Teacher, Parent/Student).
- Admin data-oriented dashboard widgets:
  - Total students
  - Total attendance records
  - Fees collected (sum of paid)
  - Pending fees (sum of unpaid/partial/pending)
- Students directory scoped by role.
- Attendance tracking and daily status updates.
- Fees ledger with due dates and status.
- Fee status updates (mark paid) for Admin and Parent.
- Reports dashboard (not available for Parent).
- Profile update page (name, phone, address).

**1. High Level System Architecture**
**Request Flow (End-to-End)**
- Browser requests route → Next.js App Router.
- Server Component loads data via Supabase Server Client.
- Server Actions mutate data (Attendance, Fees, Student updates).
- Supabase Auth validates session; RLS enforces data access at query level.
- Supabase Postgres persists data; Next.js revalidates affected paths.

**Browser → Next.js → Supabase → Database**
- Client requests are handled by Next.js.
- Data reads happen in Server Components for secure access and fewer client round-trips.
- Mutations happen in Server Actions (server-side, no public API surface).
- Supabase communicates with Postgres under RLS constraints.

**Server vs Client Components**
- Server Components: primary for lists, dashboards, reports, and data-heavy views.
- Client Components: only for interactive widgets (filters, inline editing, modal forms).
- Data fetching remains server-side to avoid exposing credentials and to leverage RLS.

**Why Server Actions Over API Routes**
- Fewer endpoints to maintain.
- Implicit server-only execution context.
- Direct integration with Next.js cache revalidation.
- Simplified security model (no extra API auth layer).

**2. Monorepo / Folder Structure**
**app/**
- App Router pages, route segments, and layout composition.
- Server Components and route-level data fetching.

**server/**
- Server Actions, Supabase server client wrappers, and access-control utilities.
- Centralized mutation workflows and validation.

**lib/**
- Shared utilities, formatters, date handling, reporting helpers.

**modules/**
- Feature domains with cohesive substructure (students, attendance, fees, reports).
- Each module contains server actions, queries, and UI compositions.

**database/**
- Schema definitions, migration notes, seed data scripts (doc-only).
- RLS policy descriptions and index planning.

**types/**
- Shared TypeScript types and DTOs for feature boundaries.

**hooks/**
- Client-only hooks for minimal UI state and form management.

**components/**
- Reusable UI components (tables, charts, form controls, cards).

**3. Authentication Design**
**Supabase Auth Flow**
- Users sign in via Supabase Auth (email/password or magic link).
- Supabase issues session and refresh tokens.
- Session is stored in secure cookies and read server-side.

**Session Handling in Next.js**
- Supabase server client reads session in Server Components and Server Actions.
- Client components use Supabase client only for lightweight session checks if needed.

**Middleware Protection**
- Next.js middleware checks authentication for protected routes.
- Redirects unauthenticated users to login.
- Optionally enriches request with role metadata from session.

**Role-Based Access Control**
- Roles: Admin, Teacher, Parent/Student.
- Roles stored in `users.role`.
- `users.school_id` anchors multi-school isolation.

**Role Checks (UI + Server)**
- UI: Server Components gate navigation and actions by role.
- Server: Server Actions validate role before mutation.
- RLS: Final enforcement in Supabase ensures role constraints.

**4. Database Schema Design**
All tables scoped to features. Multi-school design with strict `school_id` boundaries.

**users**
- Purpose: application profile linked to Supabase auth.
- Columns: id (uuid, matches auth), school_id, role, full_name, email, created_at.
- Relationships: users.school_id → schools.id.
- Indexing: index on school_id, role.

**schools**
- Purpose: tenant boundary.
- Columns: id (uuid), name, timezone, created_at.
- Relationships: one-to-many with users, students.
- Indexing: primary key.

**students**
- Purpose: student records for attendance and fees.
- Columns: id (uuid), school_id, student_code, full_name, grade_level, status, created_at.
- Relationships: students.school_id → schools.id.
- Indexing: index on school_id, student_code, grade_level.

**guardians**
- Purpose: parent/guardian linkage to students.
- Columns: id (uuid), school_id, user_id, student_id, relationship, created_at.
- Relationships: guardians.user_id → users.id; guardians.student_id → students.id.
- Indexing: index on user_id, student_id, school_id.

**enrollments**
- Purpose: teacher-to-student assignments and grade context.
- Columns: id (uuid), school_id, student_id, teacher_id, class_label, start_date, end_date.
- Relationships: enrollments.student_id → students.id; enrollments.teacher_id → users.id.
- Indexing: index on teacher_id, student_id, school_id, active range (start/end).

**attendance**
- Purpose: daily/period attendance records.
- Columns: id (uuid), school_id, student_id, date, period, status, recorded_by, recorded_at.
- Relationships: attendance.student_id → students.id; recorded_by → users.id.
- Indexing: composite index on (school_id, date), (student_id, date), (recorded_by).

**fees**
- Purpose: fee ledger per student.
- Columns: id (uuid), school_id, student_id, fee_type, amount, due_date, status, created_at.
- Relationships: fees.student_id → students.id.
- Indexing: index on school_id, student_id, status, due_date.

**fee_payments**
- Purpose: payment transactions against fees.
- Columns: id (uuid), school_id, fee_id, amount, paid_at, method, recorded_by.
- Relationships: fee_payments.fee_id → fees.id; recorded_by → users.id.
- Indexing: index on fee_id, school_id, paid_at.

**5. Row Level Security Policies (Logic Only)**
**Admin**
- Full access to all rows where `school_id` matches admin’s school.
- Can read/write across students, attendance, fees, and reports.

**Teacher**
- Read students assigned via `enrollments.teacher_id = auth.uid`.
- Attendance: read/write for assigned students only.
- Fees: read-only for assigned students.

**Parent/Student**
- Read-only for students linked in `guardians.user_id = auth.uid`.
- Attendance and fees: read-only for linked students.

**Policy Enforcement**
- `school_id` must always match user’s school for all tables.
- Mutations restricted by role + ownership/assignment.
- Reports use same underlying RLS-protected queries.

**6. Feature Architecture**
**Student Management**
- Data flow: Server Component loads students by role scope.
- Server Actions: create/update student (Admin only).
- UI: server-rendered list + client modal for edits.

**Attendance**
- Data flow: Server Component loads attendance for selected date and student set.
- Server Actions: mark attendance by teacher/admin.
- UI: client-side grid for fast input; server action on submit; revalidate page.

**Fee Tracking**
- Data flow: Server Component loads fees and balances per student.
- Server Actions: Admin records fees and payments.
- UI: server-rendered fee list; client modal to record payment.

**Reports Dashboard**
- Data flow: Server Component executes aggregate queries (attendance rates, fee balances).
- Server Actions: none (read-only).
- UI: server-rendered charts/tables; client filters only for local interactions.

**7. State Management Strategy**
- Mostly server state: data lives in Supabase and is fetched in Server Components.
- Minimal client state: UI-only state for filters, modals, and table pagination.
- Caching: Next.js fetch caching for read-heavy pages; invalidated on mutation.
- Revalidation: server actions call `revalidatePath` for affected dashboards and lists.

**Deployment (Vercel + Supabase)**
- Vercel for Next.js hosting and environment variables.
- Supabase for DB/Auth/RLS; connect via server-side secrets.
- Preview deployments for hackathon iteration and stakeholder demos.

**AI-Assisted Development (Codex)**
- Use Codex to draft schemas, policy logic, and server action outlines.
- Keep human review for RLS correctness and role boundary checks.
