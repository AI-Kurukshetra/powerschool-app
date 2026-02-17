-- SCHOOL
insert into schools (id,name) values
('11111111-1111-1111-1111-111111111111','Green Valley School');

-- USERS
insert into users (id,school_id,role,full_name,email) values
('1da35a03-f905-47ab-9ecf-11a5acce8fc8','11111111-1111-1111-1111-111111111111','admin','Principal','admin@school.com'),
('1c8208b5-aacd-4bf3-a425-9b8670d8cd29','11111111-1111-1111-1111-111111111111','teacher','Mrs Sharma','teacher@school.com'),
('088702aa-ac76-4c49-8d75-cc81343eb25a','11111111-1111-1111-1111-111111111111','parent','Rahul Parent','parent@school.com');

-- STUDENTS
insert into students (id,school_id,student_code,full_name,grade_level) values
('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','ST001','Aarav Patel','5'),
('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','ST002','Diya Shah','5');


-- ENROLLMENT
insert into enrollments (school_id,student_id,teacher_id,class_label,start_date)
values
('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','1c8208b5-aacd-4bf3-a425-9b8670d8cd29','5A','2025-06-01'),
('11111111-1111-1111-1111-111111111111','33333333-3333-3333-3333-333333333333','1c8208b5-aacd-4bf3-a425-9b8670d8cd29','5A','2025-06-01');

-- FEES
insert into fees (id,school_id,student_id,fee_type,amount,due_date)
values
('44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','tuition',5000,'2026-03-01');