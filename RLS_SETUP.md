# Supabase RLS (Row Level Security) 설정 가이드

## 문제: "Error fetching departments" 에러

이 에러는 보통 다음 중 하나의 원인입니다:
1. 테이블이 아직 생성되지 않음
2. RLS 정책이 설정되어 있어서 접근이 막힘

## 해결 방법

### 1. 테이블 생성 확인

Supabase Dashboard > SQL Editor에서 다음을 실행하세요:

```sql
-- 테이블이 존재하는지 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('doctors', 'hospitals', 'departments');
```

### 2. RLS 정책 설정 (가장 중요!)

Supabase Dashboard > Authentication > Policies에서 각 테이블에 대해 다음 정책을 설정하세요:

#### Departments 테이블
1. **SELECT 정책 (읽기)**
   - Policy name: `Allow public read access`
   - Allowed operation: `SELECT`
   - Target roles: `anon`, `authenticated`
   - USING expression: `true` (모두 읽기 가능)

2. **INSERT 정책 (추가)**
   - Policy name: `Allow authenticated insert`
   - Allowed operation: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression: `true`

3. **UPDATE 정책 (수정)**
   - Policy name: `Allow authenticated update`
   - Allowed operation: `UPDATE`
   - Target roles: `authenticated`
   - USING expression: `true`

4. **DELETE 정책 (삭제)**
   - Policy name: `Allow authenticated delete`
   - Allowed operation: `DELETE`
   - Target roles: `authenticated`
   - USING expression: `true`

#### Hospitals 테이블
동일한 정책을 적용하세요.

#### Doctors 테이블
동일한 정책을 적용하세요.

### 3. 빠른 해결 방법 (개발 환경용)

개발 중이라면 임시로 RLS를 비활성화할 수 있습니다:

```sql
-- RLS 비활성화 (개발 환경에서만 사용!)
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;
```

**주의**: 프로덕션 환경에서는 절대 사용하지 마세요!

### 4. SQL로 정책 직접 생성

SQL Editor에서 다음을 실행하세요:

```sql
-- Departments 테이블 정책
CREATE POLICY "Allow public read access" ON public.departments
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert" ON public.departments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.departments
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete" ON public.departments
  FOR DELETE
  TO authenticated
  USING (true);

-- Hospitals 테이블 정책
CREATE POLICY "Allow public read access" ON public.hospitals
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert" ON public.hospitals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.hospitals
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete" ON public.hospitals
  FOR DELETE
  TO authenticated
  USING (true);

-- Doctors 테이블 정책
CREATE POLICY "Allow public read access" ON public.doctors
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert" ON public.doctors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.doctors
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete" ON public.doctors
  FOR DELETE
  TO authenticated
  USING (true);
```

### 5. 에러 확인

브라우저 콘솔에서 더 자세한 에러 메시지를 확인하세요:
- `message`: 에러 메시지
- `code`: 에러 코드 (예: "PGRST301" = RLS 정책 위반)
- `details`: 추가 세부 정보

### 6. 테스트

정책 설정 후 브라우저를 새로고침하고 다시 시도하세요.

