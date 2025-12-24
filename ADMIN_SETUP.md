# 관리자 시스템 설정 가이드

이 가이드는 관리자 등록 및 인증 시스템 설정 방법을 설명합니다.

## 📋 목차

1. [데이터베이스 설정](#데이터베이스-설정)
2. [관리자 등록](#관리자-등록)
3. [관리자 로그인](#관리자-로그인)
4. [보안 고려사항](#보안-고려사항)

## 🗄️ 데이터베이스 설정

### 1단계: Supabase SQL 실행

Supabase 대시보드에서 SQL Editor를 열고 다음 스크립트를 실행하세요:

```sql
-- scripts/004_create_admins_table.sql 파일의 내용을 실행
```

또는 Supabase 대시보드에서:
1. **SQL Editor** 탭으로 이동
2. `scripts/004_create_admins_table.sql` 파일의 내용을 복사
3. **Run** 버튼 클릭

### 테이블 구조

```sql
admins (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 👤 관리자 등록

### 등록 페이지 접속

```
http://localhost:3000/admin/register
```

### 등록 양식

1. **관리자 이름**: 최소 3자 이상 (고유해야 함)
2. **비밀번호**: 최소 8자 이상
3. **비밀번호 확인**: 동일한 비밀번호 재입력

### 등록 프로세스

```
사용자 입력
    ↓
검증 (이름 길이, 비밀번호 강도, 일치 여부)
    ↓
중복 확인 (이미 존재하는 이름인지 확인)
    ↓
비밀번호 해시 처리
    ↓
Supabase admins 테이블에 저장
    ↓
자동으로 로그인 페이지로 리다이렉트
```

## 🔐 관리자 로그인

### 로그인 페이지 접속

```
http://localhost:3000/admin/login
```

### 로그인 프로세스

```
이름 + 비밀번호 입력
    ↓
비밀번호 해시 생성
    ↓
Supabase에서 일치하는 관리자 확인
    ↓
인증 성공 시 localStorage에 토큰 저장
    ↓
관리자 페이지로 리다이렉트
```

### 세션 관리

- **유효 기간**: 24시간
- **저장 위치**: `localStorage`
- **토큰 키**: `admin_auth`, `admin_auth_time`

## 🛡️ 보안 고려사항

### 현재 구현

✅ **구현된 보안 기능:**
- 비밀번호 해시 처리 (simpleHash)
- Row Level Security (RLS) 활성화
- 세션 만료 (24시간)
- 이름 중복 확인
- 비밀번호 최소 길이 검증

⚠️ **주의사항:**
현재는 간단한 해시 함수를 사용합니다. **프로덕션 환경**에서는 다음을 권장합니다:

### 프로덕션 권장사항

1. **bcrypt 사용**
```bash
npm install bcrypt
npm install -D @types/bcrypt
```

2. **환경 변수 설정**
```env
# .env.local
JWT_SECRET=your_secure_random_string
SESSION_DURATION=86400000  # 24 hours in ms
```

3. **HTTPS 사용**
- 프로덕션에서는 반드시 HTTPS 사용
- 민감한 정보 전송 시 암호화

4. **Rate Limiting**
- 로그인 시도 횟수 제한
- IP 기반 제한 구현

## 📁 파일 구조

```
├── scripts/
│   └── 004_create_admins_table.sql    # DB 테이블 생성
├── lib/
│   ├── auth.ts                         # 인증 로직
│   └── supabase/
│       └── admins.ts                   # 관리자 CRUD
├── app/
│   └── admin/
│       ├── register/
│       │   └── page.tsx               # 관리자 등록 페이지
│       ├── login/
│       │   └── page.tsx               # 관리자 로그인 페이지
│       └── add-doctor/
│           └── page.tsx               # 관리자 대시보드
```

## 🔑 API 엔드포인트

### 관리자 관리

```typescript
// lib/supabase/admins.ts

// 관리자 등록
registerAdmin(name: string, password: string): Promise<Admin>

// 관리자 인증
verifyAdmin(name: string, password: string): Promise<boolean>

// 관리자 목록
getAdmins(): Promise<Admin[]>

// 관리자 삭제
deleteAdmin(adminId: string): Promise<void>

// 이름 중복 확인
checkAdminExists(name: string): Promise<boolean>
```

## 🚀 시작하기

### 1단계: 데이터베이스 설정

```bash
# Supabase SQL Editor에서 실행
cat scripts/004_create_admins_table.sql
```

### 2단계: 첫 번째 관리자 등록

```
1. http://localhost:3000/admin/register 접속
2. 이름과 비밀번호 입력
3. "관리자 등록" 버튼 클릭
```

### 3단계: 로그인

```
1. http://localhost:3000/admin/login 접속
2. 등록한 이름과 비밀번호로 로그인
3. 관리자 대시보드에서 의사 정보 관리
```

## 🔄 업그레이드 경로

### Phase 1 (현재)
- ✅ 기본 인증 시스템
- ✅ DB 기반 관리자 저장
- ✅ 간단한 해시 처리

### Phase 2 (프로덕션)
- 🔲 bcrypt 비밀번호 해싱
- 🔲 JWT 토큰 기반 인증
- 🔲 Refresh Token 구현
- 🔲 Rate Limiting
- 🔲 2FA (Two-Factor Authentication)

## 📞 문제 해결

### 로그인 실패

**문제**: "이름 또는 비밀번호가 올바르지 않습니다"

**해결책**:
1. 이름과 비밀번호 재확인
2. Supabase에서 admins 테이블 확인
3. RLS 정책 확인

### 등록 실패

**문제**: "이미 존재하는 관리자 이름입니다"

**해결책**:
1. 다른 이름 사용
2. 또는 기존 관리자 삭제 후 재등록

### 세션 만료

**문제**: 관리자 페이지 접근 시 로그인 페이지로 리다이렉트

**해결책**:
- 정상 동작입니다 (24시간 후 자동 만료)
- 다시 로그인하세요

## 📝 추가 정보

- 관리자는 의사, 병원, 진료과 정보를 관리할 수 있습니다
- 여러 관리자 계정을 생성할 수 있습니다
- 각 관리자는 고유한 이름을 가져야 합니다

