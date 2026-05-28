-- RLS policies for hlc_doctorinfo
-- Supabase Dashboard > SQL Editor 에서 실행하세요.

-- ============================================================
-- 1. admins 테이블: 클라이언트 접근 차단 (로그인/회원가입은 서버 API가 service_role로 처리)
-- ============================================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to admins" ON public.admins;
DROP POLICY IF EXISTS "Allow public insert access to admins" ON public.admins;

-- admins에는 anon/authenticated용 정책을 두지 않습니다.
-- /api/admin/login, /api/admin/register 가 service_role로 접근합니다.

-- ============================================================
-- 2. doctors / hospitals / departments: 공개 읽기 + 관리자 쓰기
--    (관리자 페이지가 브라우저 anon key로 직접 CRUD)
-- ============================================================

-- doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.doctors;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.doctors;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.doctors;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.doctors;
DROP POLICY IF EXISTS "public_read_doctors" ON public.doctors;
DROP POLICY IF EXISTS "public_insert_doctors" ON public.doctors;
DROP POLICY IF EXISTS "public_update_doctors" ON public.doctors;
DROP POLICY IF EXISTS "public_delete_doctors" ON public.doctors;

CREATE POLICY "public_read_doctors"
  ON public.doctors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_insert_doctors"
  ON public.doctors FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "public_update_doctors"
  ON public.doctors FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_delete_doctors"
  ON public.doctors FOR DELETE
  TO anon, authenticated
  USING (true);

-- hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.hospitals;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.hospitals;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.hospitals;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.hospitals;
DROP POLICY IF EXISTS "public_read_hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "public_insert_hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "public_update_hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "public_delete_hospitals" ON public.hospitals;

CREATE POLICY "public_read_hospitals"
  ON public.hospitals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_insert_hospitals"
  ON public.hospitals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "public_update_hospitals"
  ON public.hospitals FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_delete_hospitals"
  ON public.hospitals FOR DELETE
  TO anon, authenticated
  USING (true);

-- departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.departments;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.departments;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.departments;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.departments;
DROP POLICY IF EXISTS "public_read_departments" ON public.departments;
DROP POLICY IF EXISTS "public_insert_departments" ON public.departments;
DROP POLICY IF EXISTS "public_update_departments" ON public.departments;
DROP POLICY IF EXISTS "public_delete_departments" ON public.departments;

CREATE POLICY "public_read_departments"
  ON public.departments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_insert_departments"
  ON public.departments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "public_update_departments"
  ON public.departments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_delete_departments"
  ON public.departments FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================
-- 3. fcm_tokens: 클라이언트 접근 차단 (API가 service_role로 처리)
-- ============================================================
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert for all users" ON public.fcm_tokens;
DROP POLICY IF EXISTS "Allow update for all users" ON public.fcm_tokens;
DROP POLICY IF EXISTS "Allow select for service role" ON public.fcm_tokens;
