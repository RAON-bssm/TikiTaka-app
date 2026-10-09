---
paths:
  - 'src/api/token.ts'
  - 'src/api/client.ts'
  - 'src/api/refresh.ts'
  - 'src/api/auth.ts'
  - 'src/components/auth/**'
  - 'src/hooks/auth/**'
  - 'src/app/(auth)/**'
---

# 인증

- **토큰은 `token.ts`의 함수로만 바꿉니다**(`setTokens`/`clearTokens`). 로그인 상태가 이 모듈의 외부 스토어에 있고, `AuthGate`가 이를 구독해 비로그인이면 로그인 화면으로 보냅니다.
- axios 인터셉터처럼 React 밖에서 세션이 끝나면 `clearTokens()`만 호출하세요. 화면 이동은 `AuthGate`가 합니다.
- **refresh 토큰은 로테이션 방식**입니다. 재발급 응답의 `refresh_token`을 반드시 저장해야 하고, 재발급 요청은 한 번에 하나만 나가도록(single-flight) 유지해야 합니다. 병렬로 보내면 먼저 성공한 쪽이 토큰을 바꿔 나머지가 실패하고 강제 로그아웃됩니다.
- 재발급은 인터셉터가 없는 전용 인스턴스(`refresh.ts`)로만 보냅니다. 공용 `client`로 보내면 재발급 요청의 401이 다시 재발급을 불러 무한 루프가 됩니다.
- 토큰 없이 부르는 공개 엔드포인트(예: 가입 화면의 `/api/location`)는 `client.ts`의 공개 경로 목록에 추가해 재발급 흐름에서 제외합니다.
- `signup_token`은 메모리에만 둡니다(만료 10분). SecureStore나 라우터 파라미터로 옮기지 마세요. 파라미터로 넘기면 URL/딥링크에 노출됩니다.
- 로그아웃 시에는 서버 호출 성공 여부와 상관없이 로컬 토큰, 쿼리 캐시, 카카오 SDK 세션을 모두 정리합니다(`useLogout`).
