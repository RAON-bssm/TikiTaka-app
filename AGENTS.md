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

| 패키지                            | 버전       | 비고                                               |
| --------------------------------- | ---------- | -------------------------------------------------- |
| `expo`                            | `~56.0.11` |                                                    |
| `expo-router`                     | `~56.2.10` |                                                    |
| `react`                           | `19.2.3`   |                                                    |
| `react-native`                    | `0.85.3`   |                                                    |
| `react-native-web`                | `~0.21.0`  |                                                    |
| `typescript`                      | `~6.0.3`   |                                                    |
| `nativewind`                      | `^4.2.5`   |                                                    |
| `tailwindcss`                     | `^3.4.19`  |                                                    |
| `@tanstack/react-query`           | `^5.101.0` |                                                    |
| `axios`                           | `^1.17.0`  |                                                    |
| `eslint`                          | `^9.39.4`  |                                                    |
| `prettier`                        | `^3.8.4`   |                                                    |
| `@expo/ui`                        | `~56.0.17` | Expo Go 미지원, dev client 필요                    |
| `expo-glass-effect`               | `~56.0.4`  | Expo Go 미지원, dev client 필요                    |
| `@react-native-seoul/kakao-login` | `^6.0.4`   | 카카오 로그인. Expo Go 미지원, dev client 필요     |
| `expo-build-properties`           | `~56.0.26` | 카카오 SDK Maven 저장소 선언용(Android). 위와 세트 |

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
  - 커스텀 훅: `src/hooks/` (도메인 훅은 `src/hooks/<도메인>/`, 도메인 무관 훅은 `src/hooks/` 바로 아래)
  - API 호출 함수·Axios 클라이언트·쿼리 키: `src/api/`
  - 서버 요청·응답 타입: `src/types/`
  - 상수/테마: `src/constants/`

---

## 5. 코딩 및 스타일 가이드라인 (Coding & Styling Style)

- 함수형 컴포넌트, 훅, 그리고 명확한 TypeScript 타입/인터페이스를 사용하세요.
- **컴포넌트 선언은 `export default function Name() {}` 형태로 통일합니다.** (`const Name = () => {}` + 별도 `export default Name` 형태 X)
  - 이름이 자동으로 붙어 디버깅에 유리하고, Expo Router 라우트 파일과도 일관됩니다.
  - **예외:** `memo`, `forwardRef` 등으로 감싸야 하는 경우에만 `const Name = memo(...)` + 별도 export를 사용하세요. 파일 내부에서만 쓰는 작은 헬퍼 컴포넌트는 `const` 화살표 함수도 허용합니다.
- 가능한 한 인라인 스타일(`style={{...}}`)이나 `StyleSheet.create` 대신 **NativeWind** 클래스명(`className="..."`)을 사용하여 스타일을 정의해 주세요.
- NativeWind v4(Tailwind CSS v3)를 사용하므로, 테마 설정이나 커스텀 스타일은 `tailwind.config.js` 파일에서 관리해 주세요. 또한 `babel.config.js` 및 `metro.config.js`에 NativeWind v4 관련 설정이 유지되어야 합니다.
- API 호출은 **Axios**로 래핑하여 작성하고, 비동기 상태(로딩, 에러, 캐싱 등)는 **TanStack Query**의 훅(`useQuery`, `useMutation`)을 사용해 관리해 주세요. 계층 분리·쿼리 키·에러 처리 규약은 **10번**을 따르세요.
- **주석은 코드만 봐서는 알 수 없는 "왜"만 짧게 남깁니다.** 서버 제약·특이 동작, 플랫폼 우회책, 지우면 버그가 나는 이유, 함정(gotcha)이 대상입니다.
  - 이름·타입이 이미 말해주는 내용, 화면이 어떻게 생겼는지에 대한 묘사, JSX 섹션 라벨(`{/* 헤더 */}`)은 쓰지 마세요.
  - 기존의 "왜" 주석은 근거 없이 지우지 마세요. 코드를 바꿔 주석이 틀려졌다면 주석도 함께 고칩니다.
  - `eslint-disable`, `@ts-expect-error`, `/// <reference>` 같은 도구용 주석은 건드리지 마세요.

---

## 6. EAS 빌드 규칙 (EAS Build Rules)

- EAS 빌드는 `eas.json`에 정의된 `EXPO_USE_PNPM=1` 환경변수를 반드시 사용해야 합니다. 해당 설정을 제거하지 마세요.

---

## 7. 캐릭터 시스템 (Character System)

사용자 아바타는 여러 파츠(part) 이미지를 겹쳐서 합성합니다. 관련 코드는 `src/constants/character/`(로직·데이터)와 `src/components/character/`(렌더 UI)에 있습니다.

### 7.1 핵심 원칙

- **이미지가 아니라 config만 저장한다.** 한 캐릭터는 `CharacterConfig`(파츠 id들의 JSON)로 표현되며, 실제 이미지는 클라이언트가 config를 보고 합성합니다.
  - 현재 config는 서버가 아니라 **기기 로컬(SecureStore)** 에만 저장됩니다(`src/api/character.ts`, `useCharacterConfig`). 서버 착용 API(`/api/equipment`)는 `product_id` 기반이고 색상 개념이 없어 `CharacterConfig`와 1:1로 맞지 않습니다.
- **파츠 에셋은 정적으로 등록한다.** React Native/Metro는 동적 경로 `require`를 지원하지 않으므로, 새 파츠 이미지를 추가하면 반드시 `src/constants/character/assets.ts`의 레지스트리에 `id ↔ require(...)`를 직접 매핑해야 합니다. 매핑하지 않은 에셋은 화면에 나타나지 않습니다.
- **모양(shape)과 색상(color)은 독립 축이다.** 눈·머리처럼 "모양은 유지하고 색만 바꾸는" 파츠는 config에 색상 키(`eyesColor`, `hairColor`)를 따로 둡니다.
- **모든 파츠 이미지는 동일한 1:1 캔버스 기준의 WebP(알파 포함)** 로 export 되어, 같은 크기로 겹치기만 하면 정렬이 맞습니다. (정위치 export가 전제)

### 7.2 파일 역할

| 파일                                               | 역할                                                                                                                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/constants/character/types.ts`                 | `CharacterConfig` 타입, 파츠 그룹 타입, 레이어 정의(`LAYERS`), 그리는 순서(z-index)를 관리. **파츠 추가/순서 변경의 기준.**                                      |
| `src/constants/character/assets.ts`                | 파츠 에셋 정적 레지스트리(`require` 매핑)와 config→이미지 해석 함수(`resolveLayerSource` 등), `DEFAULT_CHARACTER_CONFIG`, 썸네일용 메타 조회(`getPartMeta`).     |
| `src/constants/character/partMeta.ts`              | **자동 생성 파일.** 파츠별 콘텐츠 영역(`bbox`)과 밝기(`isDark`). 꾸미기 화면 썸네일의 확대·배경색에 사용. 직접 수정하지 말고 `pnpm generate:part-meta`로 재생성. |
| `src/constants/character/customize.ts`             | 꾸미기 화면의 카테고리 탭 정의(`CATEGORY_DEFS`)와 선택지 생성 로직, 색상 스와치 hex(`COLOR_HEX`).                                                                |
| `src/components/character/Character.tsx`           | config를 받아 파츠를 순서대로 겹쳐 그리는 순수 렌더 컴포넌트. 아바타/미리보기 등 어디서든 재사용.                                                                |
| `src/components/character/CharacterCustomizer.tsx` | config 상태를 소유하고 미리보기 + 파츠 선택 UI를 묶는 편집기 컴포넌트.                                                                                           |

### 7.3 파츠 그룹 3종

`assets.ts`의 레지스트리는 파츠 성격에 따라 3가지로 나뉩니다.

- **SIMPLE_ASSETS** (`body`, `mouth`, `clothing`, `accessory`): 모양만 있는 파츠. `그룹 → 모양 → 이미지`. 파일 경로 `assets/character/<그룹 폴더>/<모양>.webp`.
- **COLOR_ASSETS** (`eyes`, `hairBack`, `hairFront`): 모양 × 색상 파츠. `그룹 → 모양 → 색상 → 이미지`. 파일 경로 `assets/character/<그룹 폴더>/<모양>/<색상>.webp`.
- **TINT_ASSETS** (`hairHighlights`): 모양 없이 색상만으로 고르는 파츠. `그룹 → 색상 → 이미지`. 파일 경로 `assets/character/<그룹 폴더>/<색상>.webp`. (눈 색 `eyesColor`를 따라가는 머리 하이라이트)

> 규칙: **id = 폴더/파일명(확장자 제외).** 그룹 폴더명은 그룹명의 kebab-case입니다(`hairBack` → `hair-back`, `hairHighlights` → `hair-highlights`). `partMeta.ts`의 키도 이 폴더 경로 기준입니다.
> 앞머리·뒷머리는 모양은 독립이지만 색상 파일명(`black`/`blond`/`brown`/`pink`)을 맞춰야 `hairColor` 하나로 앞/뒤가 같은 색으로 렌더됩니다. 색 선택지는 뒷머리 모양 기준으로 만들어지므로, 새 머리 색은 앞·뒤 모든 모양에 같은 파일명으로 넣으세요. 빠진 조합은 에러 없이 해당 레이어만 사라집니다.
> 같은 이유로 머리 하이라이트 색(`hair-highlights/<색>.webp`)은 눈 색 파일명과 맞춰야 합니다.

### 7.4 새 파츠(에셋) 추가 방법

1. 위 경로 규칙에 맞춰 `assets/character/...`에 WebP를 넣습니다. (1:1 캔버스, 정위치 export)
2. `assets.ts`의 해당 레지스트리(`SIMPLE_ASSETS`/`COLOR_ASSETS`/`TINT_ASSETS`)에 `'<id>': require('@/assets/character/...')`를 추가합니다.
3. `pnpm generate:part-meta`를 실행해 `partMeta.ts`를 재생성하고, 생성 결과를 함께 커밋합니다. (레지스트리에 있는데 메타가 없으면 스크립트가 실패로 알려줍니다)
4. 끝. `getShapeOptions`/`getColorOptions`가 레지스트리를 읽어 꾸미기 화면의 선택지를 **자동으로** 만들어냅니다. 화면 코드는 건드릴 필요가 없습니다.

- **완전히 새로운 파츠 종류**를 추가하려면(기존 그룹이 아닌): `types.ts`에 그룹 타입과 `LAYERS` 배열(그리는 순서)을, 필요하면 `CharacterConfig` 키와 `customize.ts`의 `CATEGORY_DEFS` 탭을 함께 추가합니다.

### 7.5 그리는 순서 (z-index)

레이어 순서는 `types.ts`의 `LAYERS` 배열 하나로 관리합니다(아래→위, 배열 앞→뒤가 뒤→앞). 순서를 바꾸려면 이 배열만 수정하세요. 예: 뒷머리 → 몸 → 코스튬 → 눈 → 입 → 앞머리 → 악세서리 → 머리 하이라이트(최상단).

- `clothing`·`accessory`는 선택 파츠(옵셔널)입니다. 매핑된 이미지가 없거나 미선택이면 `Character` 컴포넌트가 해당 레이어를 자동으로 skip 합니다.
- 꾸미기 화면에서 이미 선택된 악세서리를 다시 누르면 벗겨집니다(`accessory: undefined`). 반면 코스튬은 항상 착용 상태로, 벗을 수 없습니다.

### 7.6 상점 아이템 ↔ 파츠 연결

- 서버와 **`product_name` = 파츠 에셋 id**(예: `"bob"`)로 맞추기로 합의되어 있습니다. `toMarketItem`(`src/constants/market.ts`)이 이 값을 `assetId`로 옮겨 착용·썸네일에 씁니다.
- 레지스트리에 없는 id가 오면 에러 없이 썸네일만 비어 보입니다. 상품이 추가되면 같은 id의 에셋이 `assets.ts`에 있는지 확인하세요.
- 서버 `product_type`은 snake_case(`hair_back`)이고, `PRODUCT_TYPE_TO_PART_KEY`로 `CharacterConfig` 키(`hairBack`)로 바꿉니다.

---

## 8. 디자인 시스템 & 테마 토큰 (Design System & Theme Tokens)

색상·간격·폰트 등 디자인 값은 모두 `tailwind.config.js`의 `theme.extend`에 토큰으로 정의되어 있습니다. **임의값(`p-[13px]`, `text-[#FF8800]`, `bg-[#123456]` 등)을 쓰지 말고 반드시 아래 토큰을 사용하세요.** 새 값이 필요하면 임의값을 박지 말고 `tailwind.config.js`에 토큰을 먼저 추가합니다.

### 8.1 색상 (Colors)

팔레트 값은 `src/constants/colors.js` 한 곳에 있고 `tailwind.config.js`가 이를 가져다 씁니다. `text-`, `bg-`, `border-` 접두사로 사용합니다.

- **`gray`** 50(`#F8F9FB`)~800(`#1A202C`): 배경·텍스트·보더 등 중립색. **순백(`#FFFFFF`)은 `gray` 스케일에 없으므로 `bg-white`/`text-white`/`border-white`를 사용한다.**
- **`primary`** 100~900, 대표색 `primary-600`(`#FC8253`, 주황): 브랜드 강조·CTA.
- **`secondary`** 100~900, 대표색 `secondary-500`(`#4078FF`, 파랑): 보조 강조.
- 예: `bg-primary-600`, `text-gray-800`, `border-secondary-500`, `bg-white`.
- SVG `color`처럼 className이 아니라 JS 값으로 색이 필요하면 `palette`(`@/constants/colors`)를 import 합니다. hex 리터럴을 직접 쓰지 마세요.

### 8.2 간격 · 반경 (Spacing & Radius)

간격(`p-`, `m-`, `gap-` 등)과 반경(`rounded-`)은 아래 토큰만 사용합니다. **px 임의값 금지.**

| 토큰   | spacing | radius |
| ------ | ------- | ------ |
| `xs`   | 4px     | 4px    |
| `sm`   | 8px     | 8px    |
| `md`   | 12px    | 12px   |
| `lg`   | 16px    | 16px   |
| `xl`   | 20px    | 24px   |
| `2xl`  | 24px    | —      |
| `3xl`  | 40px    | —      |
| `4xl`  | 48px    | —      |
| `full` | —       | 9999px |

- 예: `px-lg`, `gap-2xl`, `rounded-md`, `rounded-full`.
- 요소 고유 크기(`w-`, `h-`)는 대응 토큰이 없어 디자인 값 그대로의 임의값(`w-[60px]` 등)을 허용합니다. 간격·반경·색·폰트 크기에는 임의값을 쓰지 마세요.

### 8.3 타이포그래피 (Typography)

- **텍스트는 raw `<Text>` 대신 `src/components/ui/Typography.tsx`의 `Typography` 컴포넌트를 사용합니다.** `variant`로 스타일을 지정하세요: `display`, `h1`~`h4`, `body1`~`body3`, `caption`. 추가 스타일은 `className`으로 얹습니다.
- 폰트 패밀리(`className`으로 직접 지정 시): `font-regular`/`font-medium`/`font-bold`(Pretendard), `font-sans`(= Pretendard-Medium, body 기본), `font-title`(OkDanDan-Bold, 제목 전용). 폰트는 `app.json`의 `expo-font` 플러그인으로 로드됩니다.
- 폰트 크기 토큰: `text-xs`(12) ~ `text-5xl`(64). 각 토큰에 lineHeight가 함께 정의되어 있습니다.

### 8.4 NativeWind `safelist` 주의

`tailwind.config.js`의 `content` 글롭에 실제 클래스 문자열이 그대로 나타나지 않고 **동적으로 조합**되는 경우(예: 변수로 클래스명을 만들 때), 해당 클래스를 `safelist`에 등록하지 않으면 스타일이 빌드에서 제거되어 적용되지 않습니다. `Typography` 등에서 쓰는 클래스가 `safelist`에 들어 있는 이유이며, 동적 클래스를 새로 도입하면 `safelist`도 함께 갱신하세요.

- `content` 글롭은 `src/app/`과 `src/components/`만 스캔합니다. `src/constants/`나 `src/hooks/`에 클래스 문자열을 두면 그대로는 빌드에 포함되지 않으니, 컴포넌트 쪽에 두거나 `safelist`에 등록하세요.

---

## 9. 컴파일러 · 라우팅 실험 기능 (React Compiler & Typed Routes)

`app.json`의 `expo.experiments`에 다음이 **활성화**되어 있습니다. 코드 작성 방식에 직접 영향을 주므로 유의하세요.

- **`reactCompiler: true`** — React Compiler가 자동으로 메모이제이션을 처리합니다. 따라서 `useMemo`, `useCallback`, `React.memo`를 **습관적으로 남발하지 마세요.** 대부분의 경우 불필요하며, 컴파일러가 최적화합니다. (참조 동일성이 외부 계약상 꼭 필요한 특수한 경우에만 명시적으로 사용)
- **`typedRoutes: true`** — Expo Router가 라우트 경로에 대한 타입을 생성합니다. `router.push('/...')`, `<Link href="...">` 등의 경로 문자열이 타입 체크되므로, 존재하지 않는 경로는 컴파일 에러가 납니다. 경로는 문자열 리터럴로 넘겨 타입 추론이 되게 하세요.

---

## 10. API 연동 규약 (API Integration)

서버 연동 코드는 **api 모듈 → 훅 → 화면** 3계층으로 나눕니다. 도메인마다 파일이 겹치지 않아 여러 사람이 동시에 다른 도메인을 붙일 수 있습니다.

| 계층     | 위치                         | 책임                                                   |
| -------- | ---------------------------- | ------------------------------------------------------ |
| api 모듈 | `src/api/<도메인>.ts`        | 엔드포인트 호출. 공통 래퍼를 벗겨 **도메인 값만** 반환 |
| 훅       | `src/hooks/<도메인>/use*.ts` | `useQuery`/`useMutation`. 쿼리 키와 캐시 무효화 담당   |
| 화면     | `src/app/**`                 | 로딩·에러 UI, 토스트 등 **사용자에게 보이는 것**       |

### 10.1 api 모듈

`ApiResponse<T>` 래퍼는 api 모듈에서 벗기고, 훅·화면에는 도메인 값만 넘깁니다.

```ts
export async function getBoards(): Promise<Board[]> {
  const { data } = await client.get<ApiResponse<BoardListData>>('/api/board');
  return data.data.board; // 래퍼는 여기서 끝난다
}
```

- 요청·응답 타입은 `src/types/<도메인>.ts`에 두고 api 모듈이 import 합니다.
- data가 없는 API는 제네릭에 `EmptyResponse`를 넣고 `Promise<void>`로 선언합니다. **서버가 주지 않는 값을 반환 타입에 적지 마세요.**

### 10.2 쿼리 키

`src/api/queryKeys.ts`의 팩토리만 사용합니다. 훅에 문자열 배열을 직접 쓰지 마세요. 새 도메인은 여기에 키를 먼저 추가합니다. (규칙은 파일 상단 주석 참고)

### 10.3 캐시 무효화

- 무효화는 도메인의 `all`을 씁니다. 접두사가 겹치므로 목록과 상세가 함께 갱신됩니다.
- **다른 도메인까지 바뀌면 그 키도 함께 무효화**합니다. 예를 들어 게시물 삭제는 서버에서 동네·개인 점수를 차감하므로 랭킹 키도 무효화해야 화면이 맞습니다.

### 10.4 에러 처리

- 실패 문구는 `getApiErrorMessage(error, fallback)`(`src/api/error.ts`)로 만듭니다. 서버가 보낸 사유를 우선 쓰고, 없을 때만 fallback으로 내려갑니다.
- **토스트는 화면에서 띄웁니다.** 훅의 `onError`와 호출부의 `onError`가 **둘 다** 실행되므로, 훅에 넣으면 같은 메시지가 두 번 뜹니다.
- 재시도·`staleTime` 기본값은 `src/api/queryClient.ts`에 있습니다. 훅에서 꼭 필요할 때만 덮어쓰세요.

### 10.5 로딩 · 에러 UI

- 로딩은 `Skeleton`, 실패는 `ErrorRetry`(`src/components/ui/feedback/`)를 씁니다. `ErrorRetry`에는 `refetch`를 넘깁니다.
- 스피너나 실패 화면을 새로 만들지 말고 위 두 개를 재사용하세요.

### 10.6 새 도메인 연동 절차

1. `src/types/<도메인>.ts`에 요청·응답 타입 (대부분 이미 정의돼 있습니다)
2. `src/api/queryKeys.ts`에 쿼리 키 추가
3. `src/api/<도메인>.ts`에 호출 함수
4. `src/hooks/<도메인>/`에 훅
5. 화면의 목 데이터를 제거하고 훅 연결

### 10.7 서버 응답의 함정

타입을 새로 만들거나 응답을 다룰 때 아래를 전제로 하세요. 엔드포인트별 세부 사항은 `src/types/<도메인>.ts`의 주석에 있습니다.

- **값이 없는 필드는 null이 아니라 키가 아예 빠집니다**(서버 `non_null` 설정). 그런 필드는 옵셔널(`?`)로 선언합니다.
- **성공 여부는 HTTP 상태로 판단합니다.** 바디의 `status`는 HTTP 상태와 다를 수 있습니다.
- 시큐리티 필터에서 막힌 401/403은 공통 래퍼가 아니라 스프링 기본 바디라 `message`가 비어 있을 수 있습니다. `getApiErrorMessage`가 이를 처리합니다.
- 일시(`DateTimeString`)는 타임존 오프셋이 없는 KST 기준 문자열입니다.
- **이미지 필드(`post_image` 등)는 URL이 아니라 S3 key입니다.** `<Image>`에 넣으려면 `useViewUrl`로 presigned URL을 받아야 합니다.
- 배열 키가 단수형인 경우가 많습니다(`product`, `match`, `board`). 추측하지 말고 타입을 확인하세요.
- `match_type` 등 일부 enum은 이름이 아니라 한글 설명(`'일반 매치'`, `'미션 위크'`)으로 내려옵니다.
- 매치 팀 이름은 `'부산광역시 북구'`처럼 시/도까지 붙은 이름입니다. 이름이 같은 구가 여러 시/도에 있으니 동네 비교는 `formatLocationName`(`src/constants/location.ts`)으로 맞춘 문자열로 합니다.

---

## 11. 인증 (Auth)

관련 코드: `src/api/token.ts`, `src/api/client.ts`, `src/api/refresh.ts`, `src/components/auth/AuthGate.tsx`, `src/hooks/auth/`.

- **토큰은 `token.ts`의 함수로만 바꿉니다**(`setTokens`/`clearTokens`). 로그인 상태가 이 모듈의 외부 스토어에 있고, `AuthGate`가 이를 구독해 비로그인이면 로그인 화면으로 보냅니다.
- axios 인터셉터처럼 React 밖에서 세션이 끝나면 `clearTokens()`만 호출하세요. 화면 이동은 `AuthGate`가 합니다.
- **refresh 토큰은 로테이션 방식**입니다. 재발급 응답의 `refresh_token`을 반드시 저장해야 하고, 재발급 요청은 한 번에 하나만 나가도록(single-flight) 유지해야 합니다. 병렬로 보내면 먼저 성공한 쪽이 토큰을 바꿔 나머지가 실패하고 강제 로그아웃됩니다.
- 재발급은 인터셉터가 없는 전용 인스턴스(`refresh.ts`)로만 보냅니다. 공용 `client`로 보내면 재발급 요청의 401이 다시 재발급을 불러 무한 루프가 됩니다.
- 토큰 없이 부르는 공개 엔드포인트(예: 가입 화면의 `/api/location`)는 `client.ts`의 공개 경로 목록에 추가해 재발급 흐름에서 제외합니다.
- `signup_token`은 메모리에만 둡니다(만료 10분). SecureStore나 라우터 파라미터로 옮기지 마세요. 파라미터로 넘기면 URL/딥링크에 노출됩니다.
- 로그아웃 시에는 서버 호출 성공 여부와 상관없이 로컬 토큰, 쿼리 캐시, 카카오 SDK 세션을 모두 정리합니다(`useLogout`).
