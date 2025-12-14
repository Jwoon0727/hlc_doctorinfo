# Supabase 연동 설정 가이드

## 1. 데이터베이스 스키마 설정

### 1.1 기본 테이블 생성
Supabase SQL Editor에서 `scripts/001_create_tables.sql` 파일의 내용을 실행하세요.

### 1.2 추가 필드 추가
`scripts/003_add_doctor_fields.sql` 파일의 내용을 실행하여 doctors 테이블에 email, phone, notes 필드를 추가하세요.

```sql
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;
```

### 1.3 샘플 데이터 추가 (선택사항)
`scripts/002_seed_data.sql` 파일의 내용을 실행하여 샘플 데이터를 추가할 수 있습니다.

## 2. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

또는 `lib/supabase/client.ts`에서 하드코딩된 값이 있다면 확인하세요.

## 3. RLS (Row Level Security) 정책 설정

Supabase Dashboard에서 다음 정책을 설정하세요:

### Doctors 테이블
- **SELECT**: 모든 사용자가 읽기 가능
- **INSERT**: 인증된 사용자만 가능 (또는 관리자만)
- **UPDATE**: 인증된 사용자만 가능 (또는 관리자만)
- **DELETE**: 인증된 사용자만 가능 (또는 관리자만)

### Hospitals 테이블
- **SELECT**: 모든 사용자가 읽기 가능
- **INSERT**: 인증된 사용자만 가능
- **UPDATE**: 인증된 사용자만 가능
- **DELETE**: 인증된 사용자만 가능

### Departments 테이블
- **SELECT**: 모든 사용자가 읽기 가능
- **INSERT**: 인증된 사용자만 가능
- **UPDATE**: 인증된 사용자만 가능
- **DELETE**: 인증된 사용자만 가능

## 4. 변경 사항

### 변경된 파일
- `lib/supabase/doctors.ts` - 새로운 Supabase CRUD 함수들
- `app/admin/add-doctor/page.tsx` - localStorage에서 Supabase로 전환

### 주요 변경점
- 모든 데이터 저장소가 localStorage에서 Supabase로 변경됨
- 비동기 처리 (async/await) 추가
- 에러 처리 추가
- UUID 기반 ID 시스템 사용

## 5. 테스트

1. `/admin/add-doctor` 페이지에 접속
2. 의사, 병원, 진료과 추가/수정/삭제 기능 테스트
3. 브라우저 콘솔에서 에러 확인
4. Supabase Dashboard에서 데이터 확인

## 문제 해결

### 에러가 발생하는 경우
1. Supabase 연결 확인 (환경 변수)
2. RLS 정책 확인
3. 데이터베이스 스키마 확인
4. 브라우저 콘솔 에러 메시지 확인

