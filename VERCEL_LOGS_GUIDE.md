# Vercel 함수 로그 확인 가이드

## 🔍 500 에러 원인 파악하기

배포 환경에서 500 에러가 발생할 때, Vercel 함수 로그를 통해 정확한 에러 메시지를 확인할 수 있습니다.

---

## 📋 1단계: 최신 코드 배포 확인

에러 로깅이 개선된 최신 코드가 배포되었는지 확인하세요.

### Git Push로 배포
```bash
git add .
git commit -m "Add detailed error logging"
git push
```

---

## 📊 2단계: Vercel 함수 로그 확인

### 방법 1: 실시간 로그 확인 (권장)

1. **Vercel Dashboard 접속**
   - https://vercel.com/
   - 프로젝트: **hlc-cheonan-doctorinfo** 선택

2. **Deployments 탭으로 이동**
   - 최신 배포 클릭
   - **Functions** 탭 클릭

3. **send-notification 함수 찾기**
   - `/api/send-notification` 함수 클릭
   - 실시간 로그 확인

4. **병원 추가 테스트**
   - 배포된 사이트에서 관리자 페이지 접속
   - 병원 추가 버튼 클릭
   - Vercel 로그 화면으로 돌아가서 새로운 로그 확인

### 방법 2: Runtime Logs에서 확인

1. **Vercel Dashboard**
   - 프로젝트 선택
   - **Logs** 탭 (또는 **Runtime Logs**)

2. **필터 적용**
   - Function: `/api/send-notification` 선택
   - 최근 로그 확인

---

## 🔎 3단계: 로그에서 찾아야 할 정보

새로운 로그 시스템은 다음 정보를 제공합니다:

### 환경변수 체크
```
Environment check:
- SUPABASE_URL: Set / Missing
- SUPABASE_SERVICE_ROLE_KEY: Set / Missing
- FIREBASE_SERVICE_ACCOUNT_KEY: Set / Missing
```

### Firebase 초기화 상태
```
Initializing Firebase Admin with service account...
Firebase Admin initialized successfully
```

또는 에러 메시지:
```
Firebase admin initialization error: ...
Error details: ...
```

---

## 🐛 4단계: 일반적인 에러와 해결방법

### 에러 1: "Missing FIREBASE_SERVICE_ACCOUNT_KEY"
```
FIREBASE_SERVICE_ACCOUNT_KEY: Missing
```

**원인**: Vercel 환경변수가 설정되지 않음

**해결**:
1. Vercel Dashboard → Settings → Environment Variables
2. `FIREBASE_SERVICE_ACCOUNT_KEY` 추가
3. Production 환경 체크
4. 재배포

### 에러 2: "Unexpected token" 또는 JSON parse error
```
Firebase admin initialization error: SyntaxError: Unexpected token
```

**원인**: JSON 형식이 잘못됨 (따옴표, 백틱, 줄바꿈 등)

**해결**:
1. 환경변수 값 확인
2. 백틱(```) 제거
3. 작은따옴표(`'`) 제거
4. 한 줄로 압축된 JSON인지 확인
5. `\n`이 `\\n`으로 이스케이프되었는지 확인

### 에러 3: "invalid_grant" 또는 "PERMISSION_DENIED"
```
Error details: invalid_grant: Invalid JWT Signature
```

**원인**: Service Account JSON이 올바르지 않거나 만료됨

**해결**:
1. Firebase Console에서 새 Service Account 키 생성
2. JSON을 한 줄로 변환
3. Vercel 환경변수 업데이트
4. 재배포

### 에러 4: "SUPABASE_SERVICE_ROLE_KEY: Missing"
```
SUPABASE_SERVICE_ROLE_KEY: Missing
```

**원인**: Supabase Service Role Key가 설정되지 않음

**해결**:
1. Vercel Dashboard → Settings → Environment Variables
2. `SUPABASE_SERVICE_ROLE_KEY` 추가
3. Production 환경 체크
4. 재배포

---

## 📝 5단계: 체크리스트

### Vercel 환경변수 확인
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Production 체크)
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` (Production 체크)

### 환경변수 형식 확인
- [ ] JSON에 백틱(```) 없음
- [ ] JSON에 작은따옴표(`'`) 없음
- [ ] JSON이 한 줄로 압축됨
- [ ] `\n`이 `\\n`으로 이스케이프됨

### 배포 확인
- [ ] 최신 코드 푸시 완료
- [ ] Vercel 배포 완료 (1-2분)
- [ ] 배포된 사이트에서 테스트

---

## 🎯 성공적인 로그 예시

정상 작동 시 로그:
```
=== send-notification API called ===
Environment check:
- SUPABASE_URL: Set
- SUPABASE_SERVICE_ROLE_KEY: Set
- FIREBASE_SERVICE_ACCOUNT_KEY: Set

Initializing Firebase Admin with service account...
Firebase Admin initialized successfully

Sending notification to 2 devices
Successfully sent notifications: 2 success, 0 failed
```

---

## 🆘 추가 도움

### Vercel CLI로 로그 확인 (고급)
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 실시간 로그 확인
vercel logs --follow
```

---

## 📞 다음 단계

1. 위의 1-3단계를 따라 Vercel 함수 로그 확인
2. 에러 메시지를 정확히 파악
3. 4단계의 해결방법 적용
4. 여전히 문제가 있다면 로그 내용 공유

로그 내용을 확인하고 알려주시면 더 정확한 해결책을 제시할 수 있습니다!
