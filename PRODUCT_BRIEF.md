**Product Brief**
PowerSchool — School Operating System

**Problem**
School operations are fragmented across disconnected tools, causing duplicated work, slow communication, and inconsistent data for administrators, teachers, students, and parents.

**Vision**
A single operating system that unifies academic, attendance, communication, and administrative workflows into one secure platform.

**Goals**
- Provide one source of truth for academic and student lifecycle data.
- Reduce administrative overhead and manual data entry.
- Improve real-time visibility and collaboration across all stakeholders.

**Target Audience**
- School administrators: principals, academic coordinators, registrars, counselors.
- Teachers: manage classes, grading, attendance, and communication.
- Students: view schedules, assignments, grades, and notifications.
- Parents/guardians: monitor progress, attendance, and school communications.

**MVP Scope (Minimal)**
- Attendance: daily/period attendance tracking for students.
- Fees: student fee records, payments, and balance status.
- Reports: basic attendance and fee reports.

**Out of Scope (MVP)**
- Role-based access and multi-tenant school setup.
- Student profiles beyond required attendance/fee identifiers.
- Class management and scheduling.
- Gradebook and assessments.
- Communication and messaging.
- Advanced analytics and predictive insights.
- Transportation, cafeteria, or facilities management modules.
- District-wide multi-school management.

**Success Metrics (MVP)**
- 50% reduction in time to produce attendance reports.
- 80% weekly active usage by staff responsible for attendance and fees.
- <5% discrepancy between fee balances and payment records.

**Tech Architecture (Next.js + Supabase + Vercel)**
- Frontend: Next.js (App Router), TypeScript, server components for data-heavy views.
- Auth: Supabase Auth (single-school setup), basic staff access control with RLS.
- Database: Supabase Postgres with tables for students, attendance, fees, and payments.
- API: Supabase client and Next.js Route Handlers for server-side operations.
- Deployment: Vercel for frontend hosting and environment management.
- Observability: Supabase logs for audit and monitoring.
- Security: Row Level Security in Supabase, audit tables for attendance and payment changes.

**Good Prompt for Architecture Design**
You are a senior product + systems architect. Based on the product brief below, design a technical architecture for the MVP using Next.js, Supabase, and Vercel. Include:
- High-level component diagram (textual)
- Data model overview (key tables and relationships)
- API surface or route handler outline
- Auth and role-based access strategy
- Deployment and environment setup
- Security and audit considerations
- Scalability assumptions and constraints

Product brief:
PowerSchool — School Operating System
A single platform where school admin, teachers, students, and parents manage academic life.
MVP scope:
- attendance
- fees
- basic reports
