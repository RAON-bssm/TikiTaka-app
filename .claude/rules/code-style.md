---
paths:
  - 'src/**/*.{ts,tsx,js}'
---

# 코딩 스타일

- 함수형 컴포넌트, 훅, 그리고 명확한 TypeScript 타입/인터페이스를 사용하세요.
- **컴포넌트 선언은 `export default function Name() {}` 형태로 통일합니다.** (`const Name = () => {}` + 별도 `export default Name` 형태 X)
  - 이름이 자동으로 붙어 디버깅에 유리하고, Expo Router 라우트 파일과도 일관됩니다.
  - **예외:** `memo`, `forwardRef` 등으로 감싸야 하는 경우에만 `const Name = memo(...)` + 별도 export를 사용하세요. 파일 내부에서만 쓰는 작은 헬퍼 컴포넌트는 `const` 화살표 함수도 허용합니다.
- 가능한 한 인라인 스타일(`style={{...}}`)이나 `StyleSheet.create` 대신 **NativeWind** 클래스명(`className="..."`)을 사용하세요. 토큰 규칙은 `design-system.md`.
- API 호출은 Axios로, 비동기 상태는 TanStack Query로 관리합니다. 계층 규약은 `api.md`.

## 주석

- **주석은 코드만 봐서는 알 수 없는 "왜"만 짧게 남깁니다.** 서버 제약·특이 동작, 플랫폼 우회책, 지우면 버그가 나는 이유, 함정(gotcha)이 대상입니다.
- 이름·타입이 이미 말해주는 내용, 화면이 어떻게 생겼는지에 대한 묘사, JSX 섹션 라벨(`{/* 헤더 */}`)은 쓰지 마세요.
- 기존의 "왜" 주석은 근거 없이 지우지 마세요. 코드를 바꿔 주석이 틀려졌다면 주석도 함께 고칩니다.
- `eslint-disable`, `@ts-expect-error`, `/// <reference>` 같은 도구용 주석은 건드리지 마세요.

## React Compiler · Typed Routes (`app.json`의 `expo.experiments`)

- **`reactCompiler: true`** — 컴파일러가 메모이제이션을 처리하므로 `useMemo`, `useCallback`, `React.memo`를 **습관적으로 쓰지 마세요.** 참조 동일성이 외부 계약상 꼭 필요한 특수한 경우에만 명시적으로 사용합니다.
- **`typedRoutes: true`** — `router.push('/...')`, `<Link href="...">`의 경로가 타입 체크됩니다. 경로는 문자열 리터럴로 넘겨 타입 추론이 되게 하세요.
