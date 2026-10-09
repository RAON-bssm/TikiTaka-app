---
paths:
  - 'src/constants/character/**'
  - 'src/components/character/**'
  - 'src/hooks/character/**'
  - 'src/hooks/equipment/**'
  - 'src/api/character.ts'
  - 'src/api/equipment.ts'
  - 'src/constants/market.ts'
  - 'src/app/(tabs)/profile/character.tsx'
  - 'assets/character/**'
---

# 캐릭터 시스템

사용자 아바타는 여러 파츠(part) 이미지를 겹쳐서 합성합니다. 새 파츠 에셋 추가 절차는 `add-character-part` 스킬을 따르세요.

## 핵심 원칙

- **이미지가 아니라 config만 저장한다.** 한 캐릭터는 `CharacterConfig`(파츠 id들의 JSON)로 표현되며, 실제 이미지는 클라이언트가 config를 보고 합성합니다.
  - config 원본은 **기기 로컬(SecureStore)** 에 저장됩니다(`src/api/character.ts`, `useCharacterConfig`). 서버 착용 API(`/api/equipment`)는 `product_id` 기반이고 색상 개념이 없어 `CharacterConfig`와 1:1로 맞지 않기 때문입니다.
  - 서버에는 **보유 상품의 착용 상태만** 맞춥니다(`useEquipCharacter`, 변환은 `src/constants/character/equipment.ts`). 기본 파츠는 상품이 아니라 보낼 수 없고, 서버 API로는 벗을 수도 없습니다.
  - 로컬 저장본이 없을 때(새 기기·재설치)만 서버 착용 상태로 모양을 복원합니다. 색은 기본값으로 돌아갑니다. 저장 키가 기기 단위라 로그아웃 때 지웁니다.
  - 다른 유저의 캐릭터(랭킹·게시물)는 `GET /api/equipment/{user_id}`로 모양만 복원하고 색은 기본값입니다(`useUserCharacter`, `UserCharacter`). 본인은 로컬 저장본을 그립니다.
  - 꾸미기 화면에서 고른 파츠는 **수정하기를 눌러야** 로컬 저장·서버 착용에 반영됩니다. 저장하지 않고 나가면 확인 팝업을 띄웁니다(`usePreventRemove`).
  - 꾸미기 화면은 상점 목록(`GET /api/product`, 보유 상품은 서버가 걸러 줌)에 있는 파츠를 미보유로 잠급니다.
- **파츠 에셋은 정적으로 등록한다.** Metro는 동적 경로 `require`를 지원하지 않으므로, 새 파츠 이미지는 `src/constants/character/assets.ts`의 레지스트리에 `id ↔ require(...)`를 직접 매핑해야 화면에 나타납니다.
- **모양(shape)과 색상(color)은 독립 축이다.** 눈·머리처럼 "모양은 유지하고 색만 바꾸는" 파츠는 config에 색상 키(`eyesColor`, `hairColor`)를 따로 둡니다.
- **모든 파츠 이미지는 동일한 1:1 캔버스 기준의 WebP(알파 포함)** 로 export 되어, 같은 크기로 겹치기만 하면 정렬이 맞습니다. (정위치 export가 전제)
- `src/constants/character/partMeta.ts`는 **자동 생성 파일**입니다(꾸미기 썸네일의 확대·배경색용 `bbox`·`isDark`). 직접 수정하지 말고 `pnpm generate:part-meta`로 재생성합니다. (hook이 직접 수정을 차단합니다.)

## 파츠 그룹 3종 (`assets.ts` 레지스트리)

- **SIMPLE_ASSETS** (`body`, `mouth`, `clothing`, `accessory`): 모양만 있는 파츠. `그룹 → 모양 → 이미지`. 파일 경로 `assets/character/<그룹 폴더>/<모양>.webp`.
- **COLOR_ASSETS** (`eyes`, `hairBack`, `hairFront`): 모양 × 색상 파츠. `그룹 → 모양 → 색상 → 이미지`. 파일 경로 `assets/character/<그룹 폴더>/<모양>/<색상>.webp`.
- **TINT_ASSETS** (`hairHighlights`): 모양 없이 색상만으로 고르는 파츠. `그룹 → 색상 → 이미지`. 파일 경로 `assets/character/<그룹 폴더>/<색상>.webp`. (눈 색 `eyesColor`를 따라가는 머리 하이라이트)

> 규칙: **id = 폴더/파일명(확장자 제외).** id는 종류가 달라도 겹치지 않도록 **`종류-이름`** 형식으로 짓습니다(`hair-back-bob`, `accessory-glasses`, `body-01`). 서버 상품 id와 1:1로 맞추기 위한 규칙입니다. 그룹 폴더명은 그룹명의 kebab-case입니다(`hairBack` → `hair-back`). `partMeta.ts`의 키도 이 폴더 경로 기준입니다.
> **색상 id는 서버 색 코드와 같은 영문 대문자**입니다(`BLACK`). 파일명은 소문자(`black.webp`)로 두고 레지스트리 키만 대문자로 적습니다.
>
> 앞머리·뒷머리는 모양은 독립이지만 색상 파일명(`black`/`blond`/`brown`/`pink`)을 맞춰야 `hairColor` 하나로 앞/뒤가 같은 색으로 렌더됩니다. 색 선택지는 뒷머리 모양 기준으로 만들어지므로, 새 머리 색은 앞·뒤 모든 모양에 같은 파일명으로 넣으세요. 빠진 조합은 에러 없이 해당 레이어만 사라집니다.
> 같은 이유로 머리 하이라이트 색(`hair-highlights/<색>.webp`)은 눈 색 파일명과 맞춰야 합니다.

## 그리는 순서 (z-index)

레이어 순서는 `types.ts`의 `LAYERS` 배열 하나로 관리합니다(배열 앞→뒤가 뒤→앞). 순서를 바꾸려면 이 배열만 수정하세요.

- `clothing`·`accessory`는 선택 파츠(옵셔널)입니다. 매핑된 이미지가 없거나 미선택이면 `Character` 컴포넌트가 해당 레이어를 자동으로 skip 합니다.
- 꾸미기 화면에서 이미 선택된 악세서리를 다시 누르면 벗겨집니다(`accessory: undefined`). 반면 코스튬은 항상 착용 상태로, 벗을 수 없습니다.
- **완전히 새로운 파츠 종류**를 추가하려면: `types.ts`에 그룹 타입과 `LAYERS` 항목을, 필요하면 `CharacterConfig` 키와 `customize.ts`의 `CATEGORY_DEFS` 탭을 함께 추가합니다.

## 상점 아이템 ↔ 파츠 연결

- 서버와 **`product_id`(문자열) = 파츠 에셋 id**(예: `"hair-back-bob"`)로 맞추기로 합의되어 있습니다. `toMarketItem`(`src/constants/market.ts`)이 이 값을 `assetId`로 옮겨 착용·썸네일에 씁니다. `product_name`은 화면 표시용 한글 이름이라 매핑에 쓰지 않습니다.
- 서버에 `종류-이름` 이전의 옛 id(`"bob"` 등)가 남아 있을 수 있어, 서버 값과 기기 저장본은 `toPartId`(`src/constants/character/legacyIds.ts`)로 새 id로 바꿔 읽습니다. 서버 시드가 새 id로 바뀌면 이 파일은 지웁니다.
- 레지스트리에 없는 id가 오면 에러 없이 썸네일만 비어 보입니다. 상품이 추가되면 같은 id의 에셋이 `assets.ts`에 있는지 확인하세요.
- 서버 `product_type`은 snake_case(`hair_back`)이고, `PRODUCT_TYPE_TO_PART_KEY`로 `CharacterConfig` 키(`hairBack`)로 바꿉니다.
