-- Insert sample hospitals
INSERT INTO public.hospitals (name, address, phone) VALUES
('서울대학교병원', '서울특별시 종로구 대학로 101', '02-2072-2114'),
('삼성서울병원', '서울특별시 강남구 일원로 81', '02-3410-2114'),
('아산병원', '서울특별시 송파구 올림픽로43길 88', '02-3010-3114'),
('세브란스병원', '서울특별시 서대문구 연세로 50-1', '02-2228-5800'),
('서울성모병원', '서울특별시 서초구 반포대로 222', '02-2258-5800')
ON CONFLICT DO NOTHING;

-- Insert sample departments
INSERT INTO public.departments (name) VALUES
('내과'),
('외과'),
('정형외과'),
('신경외과'),
('소아청소년과'),
('산부인과'),
('이비인후과'),
('안과'),
('피부과'),
('정신건강의학과'),
('가정의학과'),
('응급의학과')
ON CONFLICT (name) DO NOTHING;

-- Insert sample doctors
INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '김철수',
  'A',
  h.id,
  d.id,
  '심장내과',
  15
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '서울대학교병원' AND d.name = '내과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '이영희',
  'B',
  h.id,
  d.id,
  '일반외과',
  10
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '삼성서울병원' AND d.name = '외과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '박민수',
  'A',
  h.id,
  d.id,
  '척추외과',
  20
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '아산병원' AND d.name = '정형외과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '최지원',
  'C',
  h.id,
  d.id,
  '뇌외과',
  8
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '세브란스병원' AND d.name = '신경외과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '정수현',
  'A',
  h.id,
  d.id,
  '소아알레르기',
  12
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '서울성모병원' AND d.name = '소아청소년과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '강태민',
  'B',
  h.id,
  d.id,
  '산과',
  14
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '서울대학교병원' AND d.name = '산부인과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '윤서아',
  'D',
  h.id,
  d.id,
  '비염',
  5
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '삼성서울병원' AND d.name = '이비인후과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '임동현',
  'A',
  h.id,
  d.id,
  '백내장',
  18
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '아산병원' AND d.name = '안과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '송미영',
  'B',
  h.id,
  d.id,
  '피부미용',
  9
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '세브란스병원' AND d.name = '피부과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '한준호',
  'C',
  h.id,
  d.id,
  '우울증',
  11
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '서울성모병원' AND d.name = '정신건강의학과'
LIMIT 1;

-- Add more doctors for variety
INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '조현우',
  'A',
  h.id,
  d.id,
  '소화기내과',
  16
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '삼성서울병원' AND d.name = '내과'
LIMIT 1;

INSERT INTO public.doctors (name, rating, hospital_id, department_id, specialization, experience_years)
SELECT 
  '권나연',
  'B',
  h.id,
  d.id,
  '흉부외과',
  13
FROM public.hospitals h
CROSS JOIN public.departments d
WHERE h.name = '아산병원' AND d.name = '외과'
LIMIT 1;
