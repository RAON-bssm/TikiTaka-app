# Expo HAS CHANGED

코드를 작성하기 전에 https://docs.expo.dev/versions/v56.0.0/ 에서 정확한 버전의 문서를 읽어보세요.

---

# TikiTaka-app 에이전트 가이드라인 (Agent Guidelines)

환영합니다! 당신은 `TikiTaka-app` 개발을 돕는 AI 어시스턴트(에이전트)입니다. 이 작업 공간에서 코드를 작성하거나 명령어를 실행할 때 다음 가이드라인을 엄격히 준수해 주세요.

---

## 1. 서비스 & 플랫폼 원칙 (Service & Platform Principles)

- **서비스 컨셉:** 동네 경쟁 앱 서비스.
- **크로스 플랫폼 일치성:** **Android**와 **iOS** 모두에서 동일한 사용자 경험, 인터페이스 및 동작을 보장해야 합니다. 표준 SafeArea 패딩 등 반드시 필요한 경우가 아니면 시각적 불일치를 유발하는 플랫폼 전용 스타일이나 로직은 피해 주세요.

---

## 2. 개발 환경 및 기술 스택 (Environment & Tech Stack)

- **프레임워크:** Expo (SDK 56, `expo@~56.0.11`) 및 Expo Router (`expo-router@~56.2.10`)
- **런타임:** React Native (`react-native@0.85.3`) / TypeScript (`typescript@~6.0.3`) / React (`react@19.2.3`)
- **패키지 매니저:** **pnpm** (절대 `npm`, `yarn`, `bun`을 사용하지 마세요)
- **스타일링:** **NativeWind v4** (`nativewind@^4.2.5`, React Native용 Tailwind CSS v3 호환 버전)
- **데이터 페칭 및 상태 관리:** **TanStack Query** (`@tanstack/react-query@^5.101.0`) & **Axios** (`axios@^1.17.0`)

### 핵심 패키지 버전 (package.json 기준)

> 패키지를 업그레이드한 경우, 아래 표도 함께 최신화해 주세요. 전체 의존성 목록은 `package.json` 참고.

| 패키지                  | 버전       | 비고                            |
| ----------------------- | ---------- | ------------------------------- |
| `expo`                  | `~56.0.11` |                                 |
| `expo-router`           | `~56.2.10` |                                 |
| `react`                 | `19.2.3`   |                                 |
| `react-native`          | `0.85.3`   |                                 |
| `react-native-web`      | `~0.21.0`  |                                 |
| `typescript`            | `~6.0.3`   |                                 |
| `nativewind`            | `^4.2.5`   |                                 |
| `tailwindcss`           | `^3.4.19`  |                                 |
| `@tanstack/react-query` | `^5.101.0` |                                 |
| `axios`                 | `^1.17.0`  |                                 |
| `eslint`                | `^9.39.4`  |                                 |
| `prettier`              | `^3.8.4`   |                                 |
| `@expo/ui`              | `~56.0.17` | Expo Go 미지원, dev client 필요 |
| `expo-glass-effect`     | `~56.0.4`  | Expo Go 미지원, dev client 필요 |

---

## 3. 패키지 및 의존성 규칙 (Package & Dependency Rules)

- **`.npmrc` 파일을 수정하거나 무시하거나 삭제하지 마세요.** 네이티브 오토링크 문제를 방지하려면 `node-linker=hoisted` 설정이 반드시 유지되어야 합니다.
- **`npm install`, `yarn add` 등 pnpm이 아닌 명령어를 실행하지 마세요.** 항상 `pnpm`을 사용해야 합니다.
- 새로운 라이브러리를 추가할 때는 아래 명령어를 사용하는 것을 권장합니다:
  ```bash
  pnpm expo install <패키지명>
  ```
  이 명령어는 현재 Expo SDK 버전과 호환되는 버전을 자동으로 설치하도록 보장합니다.

## 4. 디렉토리 구조 (Expo Router & Feature-based Structure)

- 앱은 Expo Router를 사용하며, 진입점 및 라우트는 `src/app/` 디렉토리 내에 위치합니다.
- 폴더 구조는 **기능 중심(Feature-based) 구조**를 따릅니다:
  - 기능별 모듈은 `src/features/<feature-name>/` 디렉토리 하위에 위치합니다.
    - 예: `src/features/auth/`, `src/features/competition/`
    - 각 기능 폴더 내부에 해당 기능 전용 `components/`, `hooks/`, `api/`(또는 `queries/`/`services/`) 등을 그룹화하여 관리합니다.
  - 여러 기능에서 공통으로 재사용하는 전역(Shared) 자원은 아래에 위치합니다:
    - 공통 UI 컴포넌트: `src/components/`
    - 공통 커스텀 훅: `src/hooks/`
    - 공통 API 설정 및 Axios 클라이언트: `src/api/` 또는 `src/services/`

---

## 5. 코딩 및 스타일 가이드라인 (Coding & Styling Style)

- 함수형 컴포넌트, 훅, 그리고 명확한 TypeScript 타입/인터페이스를 사용하세요.
- 가능한 한 인라인 스타일(`style={{...}}`)이나 `StyleSheet.create` 대신 **NativeWind** 클래스명(`className="..."`)을 사용하여 스타일을 정의해 주세요.
- NativeWind v4(Tailwind CSS v3)를 사용하므로, 테마 설정이나 커스텀 스타일은 `tailwind.config.js` 파일에서 관리해 주세요. 또한 `babel.config.js` 및 `metro.config.js`에 NativeWind v4 관련 설정이 유지되어야 합니다.
- API 호출은 **Axios**로 래핑하여 작성하고, 비동기 상태(로딩, 에러, 캐싱 등)는 **TanStack Query**의 훅(`useQuery`, `useMutation`)을 사용해 관리해 주세요.
- 코드 내 기존 주석이나 문서(Docstring)는 훼손하지 않고 온전히 보존해야 합니다.

---

## 6. EAS 빌드 규칙 (EAS Build Rules)

- EAS 빌드는 `eas.json`에 정의된 `EXPO_USE_PNPM=1` 환경변수를 반드시 사용해야 합니다. 해당 설정을 제거하지 마세요.
