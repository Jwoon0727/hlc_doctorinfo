# Upstash Redis 설정 가이드

이 프로젝트는 Upstash Redis를 사용하여 서버 사이드 캐싱을 구현합니다.

## 1. Upstash Redis 계정 생성

1. [Upstash 콘솔](https://console.upstash.com/)에 접속합니다
2. 계정을 만들거나 로그인합니다
3. "Create Database" 버튼을 클릭합니다
4. 다음 설정으로 데이터베이스를 생성합니다:
   - **Name**: `doctor-search-cache` (또는 원하는 이름)
   - **Type**: Regional (더 빠름) 또는 Global (지리적 분산)
   - **Region**: 가장 가까운 지역 선택 (예: Seoul)
   - **TLS**: Enabled (권장)

## 2. 환경 변수 설정

1. 프로젝트 루트에 `.env.local` 파일을 생성합니다:

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-database-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

2. Upstash 콘솔에서 데이터베이스를 선택하고 "REST API" 탭으로 이동합니다
3. **UPSTASH_REDIS_REST_URL**과 **UPSTASH_REDIS_REST_TOKEN** 값을 복사하여 `.env.local` 파일에 붙여넣습니다

## 3. 캐시 설정

캐시 TTL(Time To Live)은 `lib/redis.ts` 파일에서 조정할 수 있습니다:

```typescript
export const CACHE_CONFIG = {
  DOCTORS_TTL: 300,    // 5분 (초 단위)
  HOSPITALS_TTL: 3600,  // 1시간
  DEPARTMENTS_TTL: 3600, // 1시간
}
```

## 4. API Routes

다음 API 엔드포인트가 캐싱을 처리합니다:

- `GET /api/doctors` - 의사 데이터 조회 (캐싱 적용)
- `POST /api/doctors` - 의사 데이터 강제 새로고침
- `GET /api/hospitals` - 병원 데이터 조회 (캐싱 적용)
- `GET /api/departments` - 진료과 데이터 조회 (캐싱 적용)

## 5. 작동 방식

1. 클라이언트가 데이터를 요청합니다
2. API Route가 먼저 Redis 캐시를 확인합니다
3. 캐시 히트: Redis에서 즉시 데이터를 반환합니다 ⚡
4. 캐시 미스: Supabase에서 데이터를 가져와 Redis에 저장한 후 반환합니다
5. TTL이 만료되면 자동으로 캐시가 갱신됩니다

## 6. 성능 개선 효과

- **초기 로딩 시간**: Supabase 쿼리를 건너뛰고 Redis에서 바로 조회
- **데이터베이스 부하 감소**: 반복적인 쿼리를 줄여 Supabase 요청 수를 최소화
- **비용 절감**: Supabase의 무료 티어 한도를 효율적으로 사용
- **확장성**: 더 많은 사용자를 처리할 수 있습니다

## 7. 모니터링

Upstash 콘솔의 "Metrics" 탭에서 다음을 확인할 수 있습니다:

- 요청 수 (Requests per second)
- 캐시 히트율 (Hit rate)
- 메모리 사용량
- 응답 시간

## 8. 무료 티어 한도

Upstash 무료 티어:
- 일일 최대 10,000 명령
- 최대 256MB 데이터
- 전 세계 모든 지역 사용 가능

## 9. 문제 해결

### Redis 연결 실패
- `.env.local` 파일이 올바른 위치에 있는지 확인
- URL과 토큰이 정확한지 확인
- Upstash 콘솔에서 데이터베이스가 활성화되어 있는지 확인

### 캐시가 업데이트되지 않음
- POST 요청을 `/api/doctors`로 보내 강제 새로고침
- TTL 시간을 조정하여 더 자주 갱신되도록 설정

### 개발 중 캐시 비활성화
`lib/redis.ts`에서 `getRedis()` 함수가 `null`을 반환하도록 수정하면 캐싱이 비활성화됩니다.

## 10. 추가 최적화

향후 추가할 수 있는 기능:
- 특정 데이터만 선택적으로 캐시 무효화
- 캐시 워밍(Warming) 전략
- 백그라운드 캐시 갱신
- 캐시 히트율 로깅 및 분석

