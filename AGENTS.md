# TikiTaka-app 에이전트 가이드

동네 경쟁 앱. Android·iOS 동일 경험이 원칙입니다. 이 파일은 모든 AI 도구가 읽는 공용 입구이며, 상세 규칙은 `.claude/rules/`에 있습니다.

## 스택

- Expo SDK 56 + Expo Router (`src/app/`), React Native 0.85, React 19.2, TypeScript 6
- NativeWind v4 (= Tailwind CSS v3), TanStack Query v5 + Axios
- **Expo API는 버전마다 바뀝니다.** 코드를 쓰기 전에 https://docs.expo.dev/versions/v56.0.0/ 문서를 확인하세요.
- `@expo/ui`, `expo-glass-effect`, 카카오 로그인은 Expo Go 미지원이라 dev client 빌드가 필요합니다.
- 지도 탭은 별도 레포(`TikiTaka-webview`)의 카카오맵 웹을 WebView로 띄웁니다.

## 명령어

- 새 패키지: `pnpm expo install <패키지>` (SDK 호환 버전 고정)
- 실행: `pnpm dev` / `pnpm ios` / `pnpm android`
- 검증: `pnpm typecheck`, `pnpm lint`
- 파츠 메타 재생성: `pnpm generate:part-meta`
- pre-commit: husky + lint-staged (eslint --fix, prettier)

## 절대 어기면 안 되는 규칙

Claude Code에서는 `.claude/hooks/`가 자동으로 차단하지만, 다른 도구는 직접 지켜야 합니다.

- 패키지 매니저는 **pnpm만** 사용합니다. `npm install`, `yarn`, `bun`, `npx`를 쓰지 마세요.
- `.npmrc`를 수정·삭제하지 마세요. `node-linker=hoisted`가 빠지면 네이티브 오토링크가 깨집니다.
- `eas.json` 빌드 프로필의 `EXPO_USE_PNPM=1`을 제거하지 마세요.
- `app.json`의 `ios.buildNumber`/`android.versionCode`는 EAS가 원격 관리합니다. 앱 버전은 `version`만 올립니다.
- `src/constants/character/partMeta.ts`는 자동 생성 파일입니다. `pnpm generate:part-meta`로만 갱신합니다.
- 간격·색·반경·폰트 크기에 Tailwind 임의값(`p-[13px]`, `text-[#FF8800]`)을 쓰지 말고 `tailwind.config.js` 토큰을 씁니다. 요소 크기(`w-[60px]`)는 허용됩니다.

## 상세 규칙 — 작업 전에 해당 파일을 읽으세요

| 작업 대상                                                     | 규칙 파일                                                 |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| 모든 작업                                                     | `.claude/rules/platform.md`, `.claude/rules/structure.md` |
| `src/**` 코드 (컴포넌트 선언, 주석, React Compiler, 라우트)   | `.claude/rules/code-style.md`                             |
| UI·스타일 (`src/app`, `src/components`, `tailwind.config.js`) | `.claude/rules/design-system.md`                          |
| 서버 연동 (`src/api`, `src/hooks`, `src/types`, 화면)         | `.claude/rules/api.md`                                    |
| 인증·토큰 (`token.ts`, `client.ts`, `refresh.ts`, `(auth)`)   | `.claude/rules/auth.md`                                   |
| 캐릭터·파츠·상점 아이템                                       | `.claude/rules/character.md`                              |
| 지도 탭·WebView 브리지                                        | `.claude/rules/map.md`                                    |
| 캐릭터 파츠 에셋 추가 절차                                    | `.claude/skills/add-character-part/SKILL.md`              |
| 스토어 릴리즈·핫픽스                                          | `.claude/skills/release/SKILL.md`                         |

## 브랜치 · 커밋

- `main` 하나로 개발합니다. 기능 브랜치 `feat/TK-<번호>`에서 PR을 올려 `main`에 머지합니다.
- 커밋 메시지: `<type>:: <한글 설명>` (예: `feat::`, `docs::`, `design::`, `chore::`)
