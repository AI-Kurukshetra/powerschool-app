-- extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================
-- SCHOOLS
-- =====================
create table schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  timezone text default 'Asia/Kolkata',
  created_at timestamptz default now()
);

-- =====================
-- USERS (linked to auth)
-- =====================
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id),
  role text check (role in ('admin','teacher','parent')),
  full_name text,
  email text,
  created_at timestamptz default now()
);

-- =====================
-- STUDENTS
-- =====================
create table students (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id),
  student_code text,
  full_name text,
  grade_level text,
  class_label text,
  section text,
  status text default 'active',
  created_at timestamptz default now()
);

-- =====================
-- TEACHER ASSIGNMENTS
-- =====================
create table teacher_assignments (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id),
  teacher_id uuid references users(id) on delete cascade,
  grade_level text,
  class_label text,
  created_at timestamptz default now(),
  unique(teacher_id, grade_level, class_label)
);

-- =====================
-- GUARDIANS
-- =====================
create table guardians (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id),
  user_id uuid references users(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  relationship text,
  created_at timestamptz default now(),
  unique(user_id, student_id)
);

-- =====================
-- ATTENDANCE
-- =====================
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id),
  student_id uuid references students(id),
  date date,
  period int default 1,
  status text check (status in ('present','absent','late')),
  recorded_by uuid references users(id),
  recorded_at timestamptz default now()
);

-- =====================
-- FEES
-- =====================
create table fees (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id),
  student_id uuid references students(id),
  fee_type text,
  amount numeric,
  due_date date,
  status text default 'pending',
  created_at timestamptz default now()
);

-- =====================
-- PAYMENTS
-- =====================
create table fee_payments (
  id uuid primary key default uuid_generate_v4(),
  school_id uuid references schools(id),
  fee_id uuid references fees(id),
  amount numeric,
  method text,
  paid_at timestamptz default now(),
  recorded_by uuid references users(id)
);