# Vercel 환경변수 설정 가이드

## 🚨 중요: Vercel에 환경변수를 추가해야 합니다!

로컬의 `.env.local` 파일은 배포 환경에 자동으로 적용되지 않습니다. Vercel 대시보드에서 직접 설정해야 합니다.

---

## 📋 설정해야 할 환경변수

### 1. SUPABASE_SERVICE_ROLE_KEY (서버 전용)
로컬 `.env.local` 파일에 있는 값을 복사하세요.

### 2. FIREBASE_SERVICE_ACCOUNT_KEY (서버 전용, 가장 중요!)
로컬 `.env.local` 파일에 있는 값을 복사하세요.

⚠️ **주의**: 
- 작은따옴표(`'`) 없이 JSON만 복사하세요!
- 백틱(```) 없이 복사하세요!
- 한 줄로 압축된 JSON을 복사하세요!

---

## 🔧 Vercel 환경변수 설정 방법

### 1단계: Vercel 대시보드 접속

1. https://vercel.com/ 로그인
2. 프로젝트 선택: **hlc-cheonan-doctorinfo**

### 2단계: 설정 페이지로 이동

1. 상단 탭에서 **Settings** 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭

### 3단계: 환경변수 추가

각 환경변수를 다음과 같이 추가하세요:

#### SUPABASE_SERVICE_ROLE_KEY 추가
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: [로컬 .env.local 파일에서 복사]
Environment: Production, Preview, Development (모두 체크)
```

**Save** 버튼 클릭

#### FIREBASE_SERVICE_ACCOUNT_KEY 추가
```
Name: FIREBASE_SERVICE_ACCOUNT_KEY
Value: [로컬 .env.local 파일에서 복사, 작은따옴표 제외]
Environment: Production, Preview, Development (모두 체크)
```

**Save** 버튼 클릭

---

## 📸 환경변수 입력 예시

### FIREBASE_SERVICE_ACCOUNT_KEY 형식
```
{"type":"service_account","project_id":"your-project","private_key_id":"xxxxx","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"your-service-account@project.iam.gserviceaccount.com",...}
```

⚠️ **중요 포인트**:
- 전체가 **한 줄**이어야 함
- `\n`이 `\\n`으로 이스케이프되어야 함
- 작은따옴표(`'`) 없음
- 백틱(```) 없음

---

## 🚀 4단계: 재배포

환경변수를 추가한 후 **재배포**가 필요합니다.

### 방법 1: Vercel 대시보드에서 재배포
1. **Deployments** 탭으로 이동
2. 최신 배포의 **...** 메뉴 클릭
3. **Redeploy** 선택
4. **Redeploy** 확인 버튼 클릭

### 방법 2: Git Push로 재배포
코드를 수정한 경우:
```bash
git add .
git commit -m "Update configuration"
git push
```

---

## ✅ 배포 완료 후 테스트

1. **Vercel 배포 완료 대기** (약 1-2분)
2. **배포된 사이트 접속**: https://hlc-cheonan-doctorinfo.vercel.app
3. **관리자 페이지에서 병원 추가 테스트**
4. **브라우저 콘솔 확인** (F12)
   - ✅ 성공: 200 응답
   - ❌ 실패: 여전히 500 에러

---

## 🔍 문제 해결

### 여전히 500 에러가 발생한다면?

#### 1. Vercel 로그 확인
```
Vercel Dashboard > Deployments > 최신 배포 클릭 > Functions 탭
/api/send-notification 로그 확인
```

상세한 로그 확인 방법은 `VERCEL_LOGS_GUIDE.md` 파일을 참고하세요.

#### 2. 환경변수 설정 확인
```
Settings > Environment Variables
- SUPABASE_SERVICE_ROLE_KEY 존재?
- FIREBASE_SERVICE_ACCOUNT_KEY 존재?
- Production 환경에 체크되어 있는지?
```

#### 3. JSON 형식 확인
`FIREBASE_SERVICE_ACCOUNT_KEY`가 올바른 JSON인지 확인:
- 작은따옴표 없이 순수 JSON만
- 한 줄로 압축됨
- `\n`이 `\\n`으로 이스케이프됨

#### 4. 재배포 확인
환경변수 추가 후 반드시 재배포했는지 확인

---

## 📝 체크리스트

- [ ] Vercel 대시보드 접속
- [ ] Settings > Environment Variables 이동
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 추가 (Production 체크)
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` 추가 (Production 체크)
- [ ] 두 환경변수 모두 Save 완료
- [ ] 재배포 (Redeploy 또는 Git Push)
- [ ] 배포 완료 대기 (1-2분)
- [ ] 배포된 사이트에서 테스트
- [ ] 푸시 알림 정상 작동 확인

---

## 🔐 보안 주의사항

1. **절대로 실제 키를 GitHub에 커밋하지 마세요!**
2. `.env.local` 파일은 `.gitignore`에 포함되어 있습니다
3. 문서 파일에도 실제 키를 포함하지 마세요
4. 환경변수 값은 로컬 `.env.local`에서만 확인하세요

---

## 🆘 추가 도움말

### Vercel 환경변수 문서
https://vercel.com/docs/projects/environment-variables

### Firebase Admin SDK 문서
https://firebase.google.com/docs/admin/setup

---

## 📞 다음 단계

1. 위의 1-3단계를 따라 Vercel 환경변수 설정
2. 재배포
3. 테스트
4. 문제가 있다면 Vercel 로그 확인 (`VERCEL_LOGS_GUIDE.md` 참고)
