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

## 4. 디렉토리 구조 (Expo Router & Type-based Structure)

- 앱은 Expo Router를 사용하며, 진입점 및 라우트는 `src/app/` 디렉토리 내에 위치합니다.
- 폴더 구조는 **타입 중심(Type-based) 구조**를 따릅니다. (별도의 `src/features/` 디렉토리는 사용하지 않습니다.)
- 컴포넌트는 `src/components/` 하위에서 다음 기준으로 분류합니다:
  - **도메인 무관 공용 UI(디자인 시스템)**: `src/components/ui/`
    - 예: `Button.tsx`, `Typography.tsx`, `input/TextInput.tsx`
    - 이 폴더 내부는 도메인이 아니라 **UI 종류/성격** 기준으로만 하위 폴더를 나눕니다. (예: `input/`, `feedback/`, `layout/`)
  - **특정 도메인 전용 컴포넌트**: `src/components/<도메인>/`
    - 예: `src/components/auth/`, `src/components/market/`, `src/components/feed/`
    - 도메인명으로 `src/components/ui/` **하위에** 폴더를 만들지 마세요. (`ui/`는 도메인 무관 UI 전용)
  - 판단 기준: 다른 도메인에서도 그대로 재사용 가능하면 `ui/`, 특정 도메인 전용이면 `components/<도메인>/`.
- 그 외 공통(Shared) 자원의 위치:
  - 공통 커스텀 훅: `src/hooks/`
  - 공통 API 설정 및 Axios 클라이언트: `src/api/` 또는 `src/services/`
  - 상수/테마: `src/constants/`

---

## 5. 코딩 및 스타일 가이드라인 (Coding & Styling Style)

- 함수형 컴포넌트, 훅, 그리고 명확한 TypeScript 타입/인터페이스를 사용하세요.
- **컴포넌트 선언은 `export default function Name() {}` 형태로 통일합니다.** (`const Name = () => {}` + 별도 `export default Name` 형태 X)
  - 이름이 자동으로 붙어 디버깅에 유리하고, Expo Router 라우트 파일과도 일관됩니다.
  - **예외:** `memo`, `forwardRef` 등으로 감싸야 하는 경우에만 `const Name = memo(...)` + 별도 export를 사용하세요. 파일 내부에서만 쓰는 작은 헬퍼 컴포넌트는 `const` 화살표 함수도 허용합니다.
- 가능한 한 인라인 스타일(`style={{...}}`)이나 `StyleSheet.create` 대신 **NativeWind** 클래스명(`className="..."`)을 사용하여 스타일을 정의해 주세요.
- NativeWind v4(Tailwind CSS v3)를 사용하므로, 테마 설정이나 커스텀 스타일은 `tailwind.config.js` 파일에서 관리해 주세요. 또한 `babel.config.js` 및 `metro.config.js`에 NativeWind v4 관련 설정이 유지되어야 합니다.
- API 호출은 **Axios**로 래핑하여 작성하고, 비동기 상태(로딩, 에러, 캐싱 등)는 **TanStack Query**의 훅(`useQuery`, `useMutation`)을 사용해 관리해 주세요.
- 코드 내 기존 주석이나 문서(Docstring)는 훼손하지 않고 온전히 보존해야 합니다.

---

## 6. EAS 빌드 규칙 (EAS Build Rules)

- EAS 빌드는 `eas.json`에 정의된 `EXPO_USE_PNPM=1` 환경변수를 반드시 사용해야 합니다. 해당 설정을 제거하지 마세요.

---

## 7. 캐릭터 시스템 (Character System)

사용자 아바타는 여러 파츠(part) 이미지를 겹쳐서 합성합니다. 관련 코드는 `src/constants/character/`(로직·데이터)와 `src/components/character/`(렌더 UI)에 있습니다.

### 7.1 핵심 원칙

- **이미지가 아니라 config만 저장한다.** 한 캐릭터는 `CharacterConfig`(파츠 id들의 JSON)로 표현되며, 서버에는 이 JSON만 저장/전송합니다. 실제 이미지는 클라이언트가 config를 보고 합성합니다.
- **파츠 에셋은 정적으로 등록한다.** React Native/Metro는 동적 경로 `require`를 지원하지 않으므로, 새 파츠 이미지를 추가하면 반드시 `src/constants/character/assets.ts`의 레지스트리에 `id ↔ require(...)`를 직접 매핑해야 합니다. 매핑하지 않은 에셋은 화면에 나타나지 않습니다.
- **모양(shape)과 색상(color)은 독립 축이다.** 눈·머리처럼 "모양은 유지하고 색만 바꾸는" 파츠는 config에 색상 키(`eyesColor`, `hairColor`)를 따로 둡니다.
- **모든 파츠 이미지는 동일한 1:1 캔버스 기준의 WebP(알파 포함)** 로 export 되어, 같은 크기로 겹치기만 하면 정렬이 맞습니다. (정위치 export가 전제)

### 7.2 파일 역할

| 파일                                               | 역할                                                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/constants/character/types.ts`                 | `CharacterConfig` 타입, 파츠 그룹 타입, 레이어 정의(`LAYERS`), 그리는 순서(z-index)를 관리. **파츠 추가/순서 변경의 기준.** |
| `src/constants/character/assets.ts`                | 파츠 에셋 정적 레지스트리(`require` 매핑)와 config→이미지 해석 함수(`resolveLayerSource` 등), `DEFAULT_CHARACTER_CONFIG`.   |
| `src/constants/character/customize.ts`             | 꾸미기 화면의 카테고리 탭 정의(`CATEGORY_DEFS`)와 선택지 생성 로직, 색상 스와치 hex(`COLOR_HEX`).                           |
| `src/components/character/Character.tsx`           | config를 받아 파츠를 순서대로 겹쳐 그리는 순수 렌더 컴포넌트. 아바타/미리보기 등 어디서든 재사용.                           |
| `src/components/character/CharacterCustomizer.tsx` | config 상태를 소유하고 미리보기 + 파츠 선택 UI를 묶는 편집기 컴포넌트.                                                      |

### 7.3 파츠 그룹 3종

`assets.ts`의 레지스트리는 파츠 성격에 따라 3가지로 나뉩니다.

- **SIMPLE_ASSETS** (`body`, `mouth`, `clothing`, `accessory`): 모양만 있는 파츠. `그룹 → 모양 → 이미지`. 파일 경로 `assets/character/<그룹>/<모양>.webp`.
- **COLOR_ASSETS** (`eyes`, `hairBack`, `hairFront`): 모양 × 색상 파츠. `그룹 → 모양 → 색상 → 이미지`. 파일 경로 `assets/character/<그룹>/<모양>/<색상>.webp`.
- **TINT_ASSETS** (`hairHighlights`): 모양 없이 색상만으로 고르는 파츠. `그룹 → 색상 → 이미지`. (예: 눈 색에 맞춘 머리 하이라이트)

> 규칙: **id = 폴더/파일명(확장자 제외).** 앞머리·뒷머리는 모양은 독립이지만 색상 키(`black`/`blond`/`brown`)를 맞춰, `hairColor` 하나로 앞/뒤가 같은 색으로 렌더됩니다.

### 7.4 새 파츠(에셋) 추가 방법

1. 위 경로 규칙에 맞춰 `assets/character/...`에 WebP를 넣습니다. (1:1 캔버스, 정위치 export)
2. `assets.ts`의 해당 레지스트리(`SIMPLE_ASSETS`/`COLOR_ASSETS`/`TINT_ASSETS`)에 `'<id>': require('@/assets/character/...')`를 추가합니다.
3. 끝. `getShapeOptions`/`getColorOptions`가 레지스트리를 읽어 꾸미기 화면의 선택지를 **자동으로** 만들어냅니다. 화면 코드는 건드릴 필요가 없습니다.

- **완전히 새로운 파츠 종류**를 추가하려면(기존 그룹이 아닌): `types.ts`에 그룹 타입과 `LAYERS` 배열(그리는 순서)을, 필요하면 `CharacterConfig` 키와 `customize.ts`의 `CATEGORY_DEFS` 탭을 함께 추가합니다.

### 7.5 그리는 순서 (z-index)

레이어 순서는 `types.ts`의 `LAYERS` 배열 하나로 관리합니다(아래→위, 배열 앞→뒤가 뒤→앞). 순서를 바꾸려면 이 배열만 수정하세요. 예: 뒷머리 → 몸 → 코스튬 → 눈 → 입 → 앞머리 → 악세서리 → 머리 하이라이트(최상단).

- `clothing`·`accessory`는 선택 파츠(옵셔널)입니다. 매핑된 이미지가 없거나 미선택이면 `Character` 컴포넌트가 해당 레이어를 자동으로 skip 합니다.
- 꾸미기 화면에서 이미 선택된 악세서리를 다시 누르면 벗겨집니다(`accessory: undefined`). 반면 코스튬은 항상 착용 상태로, 벗을 수 없습니다.
