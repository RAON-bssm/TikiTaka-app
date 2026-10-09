# 디렉토리 구조 (타입 중심)

- 라우트는 `src/app/`(Expo Router). 별도의 `src/features/` 디렉토리는 사용하지 않습니다.
- 컴포넌트는 `src/components/` 하위에서 다음 기준으로 분류합니다:
  - **도메인 무관 공용 UI(디자인 시스템)**: `src/components/ui/`
    - 예: `Button.tsx`, `Typography.tsx`, `input/TextInput.tsx`
    - 이 폴더 내부는 도메인이 아니라 **UI 종류/성격** 기준으로만 하위 폴더를 나눕니다. (예: `input/`, `feedback/`, `layout/`)
  - **특정 도메인 전용 컴포넌트**: `src/components/<도메인>/`
    - 도메인명으로 `src/components/ui/` **하위에** 폴더를 만들지 마세요. (`ui/`는 도메인 무관 UI 전용)
  - 판단 기준: 다른 도메인에서도 그대로 재사용 가능하면 `ui/`, 특정 도메인 전용이면 `components/<도메인>/`.
- 커스텀 훅: 도메인 훅은 `src/hooks/<도메인>/`, 도메인 무관 훅은 `src/hooks/` 바로 아래.
- API 호출 함수·Axios 클라이언트·쿼리 키: `src/api/` / 서버 요청·응답 타입: `src/types/` / 상수·테마: `src/constants/`
