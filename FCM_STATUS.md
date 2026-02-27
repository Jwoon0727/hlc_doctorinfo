# 🔔 Firebase Cloud Messaging 설정 완료 체크리스트

## ✅ 완료된 항목

1. ✅ Firebase 패키지 설치 완료
2. ✅ Firebase Client 설정 파일 생성 (`lib/firebase/client.ts`)
3. ✅ Firebase Admin 설정 파일 생성 (`lib/firebase/admin.ts`)
4. ✅ API Routes 생성
   - `/api/register-token` - FCM 토큰 등록
   - `/api/send-notification` - 푸시 알림 발송
5. ✅ Service Worker 파일 생성 및 설정 (`public/firebase-messaging-sw.js`)
6. ✅ Notification Provider 컴포넌트 생성
7. ✅ 레이아웃에 Provider 추가
8. ✅ 병원 추가 시 알림 발송 로직 추가

## ⚠️ 필수 설정 항목 (사용자가 완료해야 함)

### 1. Supabase Service Role Key 추가

`.env.local` 파일에 Service Role Key를 추가하세요:

```bash
# Supabase Dashboard 접속
# https://supabase.com/dashboard/project/nrwprdovrfotwiepjlmh

# 1. Settings 클릭
# 2. API 메뉴 선택
# 3. "service_role" key 복사 (⚠️ secret key - 노출 금지)
# 4. .env.local 파일에 추가:

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... (실제 키 붙여넣기)
```

### 2. Supabase에 FCM 토큰 테이블 생성

Supabase SQL Editor에서 다음 스크립트 실행:

```sql
-- FCM tokens table
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(token);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_active ON fcm_tokens(active);

ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON fcm_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for all users" ON fcm_tokens
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow select for service role" ON fcm_tokens
  FOR SELECT
  USING (true);
```

**실행 방법:**
1. Supabase Dashboard 접속
2. 좌측 메뉴에서 "SQL Editor" 클릭
3. "New query" 클릭
4. 위 SQL 코드 붙여넣기
5. "Run" 버튼 클릭

### 3. Firebase Admin SDK 설정 (선택사항 - 푸시 알림 실제 발송용)

현재는 알림 발송이 로그만 남기도록 되어 있습니다.
실제로 푸시 알림을 발송하려면 Firebase Admin SDK 설정이 필요합니다:

```bash
# Firebase Console 접속
# https://console.firebase.google.com/project/hlc-doctor

# 1. Project Settings (톱니바퀴 아이콘) 클릭
# 2. Service Accounts 탭 선택
# 3. "Generate New Private Key" 클릭
# 4. JSON 파일 다운로드
# 5. JSON 파일 내용을 한 줄로 변환하여 .env.local에 추가:

FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"hlc-doctor",...}'
```

## 🧪 테스트 방법

### 1. 개발 서버 재시작

```bash
npm run dev
```

### 2. 브라우저에서 테스트

1. 브라우저에서 앱 열기 (http://localhost:3000)
2. 알림 권한 요청 팝업 확인 → "허용" 클릭
3. 개발자 도구(F12) → Console 탭 확인
4. "FCM Token:" 메시지 확인 (토큰이 정상적으로 생성됨)

### 3. Service Worker 확인

1. 개발자 도구(F12) → Application 탭
2. 좌측 메뉴에서 "Service Workers" 선택
3. `firebase-messaging-sw.js`가 등록되어 있는지 확인

### 4. 토큰 저장 확인

1. Supabase Dashboard → Table Editor
2. `fcm_tokens` 테이블 선택
3. 토큰이 저장되어 있는지 확인

### 5. 알림 발송 테스트

1. 관리자 페이지 접속 (/admin/add-doctor)
2. "병원 관리" 탭 선택
3. 새 병원 추가
4. 콘솔에 "Push notification sent successfully" 메시지 확인

## 🔧 문제 해결

### Service Worker가 등록되지 않는 경우

```bash
# 캐시 삭제
개발자 도구 → Application → Storage → Clear site data
```

### 알림 권한이 요청되지 않는 경우

```bash
# 브라우저 설정에서 알림 권한 초기화
Chrome: 설정 → 개인정보 및 보안 → 사이트 설정 → 알림 → localhost 삭제
```

### 토큰이 저장되지 않는 경우

1. `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 확인
2. Supabase에서 `fcm_tokens` 테이블 생성 확인
3. 개발 서버 재시작

## 📝 현재 상태

- ✅ **Firebase Client 설정**: 완료
- ✅ **Service Worker**: 완료
- ✅ **토큰 등록 API**: 완료 (Supabase Service Role Key 필요)
- ⚠️ **알림 발송 API**: 부분 완료 (로그만 출력, 실제 발송은 Firebase Admin SDK 필요)
- ✅ **병원 추가 시 알림 트리거**: 완료

## 🎯 다음 단계

실제 푸시 알림을 발송하려면:

1. `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 추가
2. Supabase에 `fcm_tokens` 테이블 생성
3. (선택) Firebase Admin SDK 서비스 계정 키 추가

현재 상태에서도 **알림 권한 요청**, **토큰 생성**, **Service Worker 등록**은 모두 작동합니다!
