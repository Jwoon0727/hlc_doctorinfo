# Firebase Cloud Messaging (FCM) 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 후 생성

## 2. Firebase 웹 앱 추가

1. Firebase 프로젝트 대시보드에서 웹 아이콘(</>)을 클릭
2. 앱 닉네임 입력 (예: "Doctor Search App")
3. Firebase SDK 설정 코드에서 config 정보 복사

## 3. Cloud Messaging 설정

1. Firebase 콘솔 좌측 메뉴에서 "Cloud Messaging" 선택
2. "웹 푸시 인증서" 탭으로 이동
3. "키 쌍 생성" 클릭하여 VAPID 키 생성
4. 생성된 키 복사

## 4. 서비스 계정 키 생성 (관리자 SDK용)

1. Firebase 콘솔 좌측 메뉴에서 "프로젝트 설정" (톱니바퀴 아이콘) 클릭
2. "서비스 계정" 탭으로 이동
3. "새 비공개 키 생성" 클릭
4. 다운로드된 JSON 파일 내용을 복사

## 5. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 추가:

```env
# Firebase Client (공개)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

# Firebase Admin (서버 전용 - 비공개)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
# 또는
FIREBASE_PROJECT_ID=your_project_id

# Supabase (기존)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 6. Supabase 테이블 생성

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

## 7. Service Worker 설정 업데이트

`public/firebase-messaging-sw.js` 파일에서 Firebase 설정을 업데이트:

```javascript
firebase.initializeApp({
  apiKey: 'YOUR_ACTUAL_API_KEY',
  authDomain: 'YOUR_ACTUAL_AUTH_DOMAIN',
  projectId: 'YOUR_ACTUAL_PROJECT_ID',
  storageBucket: 'YOUR_ACTUAL_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_ACTUAL_SENDER_ID',
  appId: 'YOUR_ACTUAL_APP_ID',
})
```

## 8. 테스트

1. 애플리케이션 실행: `npm run dev`
2. 브라우저에서 앱 열기
3. 알림 권한 요청 수락
4. 관리자 페이지에서 병원 추가
5. 푸시 알림 수신 확인

## 9. 프로덕션 배포

### Vercel 배포 시

1. Vercel 대시보드에서 프로젝트 선택
2. Settings > Environment Variables 이동
3. 모든 환경 변수 추가
4. 재배포

### 주의사항

- `FIREBASE_SERVICE_ACCOUNT_KEY`는 반드시 서버 환경 변수로만 설정
- VAPID 키는 공개 키이므로 `NEXT_PUBLIC_` 접두사 사용 가능
- Service Worker는 HTTPS 환경에서만 작동 (localhost 제외)

## 10. 문제 해결

### 알림이 작동하지 않는 경우

1. 브라우저 콘솔에서 에러 메시지 확인
2. Firebase Console > Cloud Messaging에서 메시지 전송 로그 확인
3. 브라우저 알림 권한 확인 (브라우저 설정)
4. Service Worker 등록 확인 (개발자 도구 > Application > Service Workers)
5. FCM 토큰이 Supabase에 정상적으로 저장되었는지 확인

### HTTPS 필요

- 프로덕션 환경에서는 반드시 HTTPS 사용
- localhost에서는 HTTP로 테스트 가능

## 기능

- ✅ 병원 추가 시 자동 푸시 알림 발송
- ✅ 모든 사용자에게 동시 알림 전송
- ✅ 포그라운드/백그라운드 알림 모두 지원
- ✅ 알림 권한 자동 요청
- ✅ FCM 토큰 자동 등록 및 관리
