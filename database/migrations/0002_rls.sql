-- enable RLS
alter table users enable row level security;
alter table students enable row level security;
alter table guardians enable row level security;
alter table teacher_assignments enable row level security;
alter table attendance enable row level security;
alter table fees enable row level security;
alter table fee_payments enable row level security;

-- =====================
-- HELPER: current user school
-- =====================
create or replace function current_school()
returns uuid
language sql
stable
as $$
  select school_id from users where id = auth.uid()
$$;

-- =====================
-- ADMIN ACCESS (full school)
-- =====================
create policy "admin full access students"
on students for all
using (school_id = current_school());

create policy "admin full access fees"
on fees for all
using (school_id = current_school());

-- =====================
-- TEACHER STUDENT ACCESS (grade scoped)
-- =====================
create policy "teacher read students"
on students for select
using (
  exists (
    select 1
    from teacher_assignments ta
    where ta.teacher_id = auth.uid()
      and ta.school_id = students.school_id
      and ta.grade_level = students.grade_level
      and ta.class_label = students.class_label
  )
);

-- =====================
-- PARENT ACCESS
-- =====================
create policy "parent read own child"
on students for select
using (
  exists (
    select 1
    from guardians g
    where g.user_id = auth.uid()
      and g.student_id = students.id
  )
);

-- =====================
-- ATTENDANCE INSERT (teacher only)
-- =====================
create policy "teacher mark attendance"
on attendance for insert
with check (recorded_by = auth.uid());

-- =====================
-- FEES READ
-- =====================
create policy "read fees by role"
on fees for select
using (
  school_id = current_school()
);
