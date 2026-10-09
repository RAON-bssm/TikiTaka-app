---
name: add-character-part
description: 캐릭터 파츠 에셋(WebP)을 추가·교체하거나 새 머리/눈 색, 새 파츠 종류를 추가할 때 사용. 에셋 경로 규칙, assets.ts 레지스트리 등록, partMeta 재생성 절차.
---

# 캐릭터 파츠 추가

설계 원칙과 id 규칙은 `.claude/rules/character.md`를 기준으로 합니다.

## 기존 그룹에 파츠 추가

1. 경로 규칙에 맞춰 `assets/character/...`에 WebP를 넣습니다. (1:1 캔버스, 알파 포함, 정위치 export)
   - SIMPLE (`body`, `mouth`, `clothing`, `accessory`): `assets/character/<그룹 폴더>/<id>.webp`
   - COLOR (`eyes`, `hairBack`, `hairFront`): `assets/character/<그룹 폴더>/<id>/<색>.webp`
   - TINT (`hairHighlights`): `assets/character/hair-highlights/<색>.webp`
   - id는 `종류-이름`(`hair-back-bob`), 색 파일명은 소문자(`black.webp`).
2. `src/constants/character/assets.ts`의 해당 레지스트리(`SIMPLE_ASSETS`/`COLOR_ASSETS`/`TINT_ASSETS`)에 `'<id>': require('@/assets/character/...')`를 추가합니다. 색 키는 대문자(`BLACK`)로 적습니다.
3. `pnpm generate:part-meta`를 실행해 `partMeta.ts`를 재생성하고, 생성 결과를 함께 커밋합니다. (레지스트리에 있는데 메타가 없으면 스크립트가 실패로 알려줍니다)
4. 끝. `getShapeOptions`/`getColorOptions`가 레지스트리를 읽어 꾸미기 화면의 선택지를 자동으로 만듭니다. 화면 코드는 건드리지 않습니다.

## 체크리스트

- 새 머리 색: 앞머리·뒷머리 **모든 모양**에 같은 색 파일명으로 넣었는가? (빠진 조합은 에러 없이 레이어만 사라짐)
- 새 눈 색: `hair-highlights/<색>.webp`도 같은 파일명으로 있는가?
- 상점 상품이면: 서버 `product_id`가 이 에셋 id와 같은가?
- 검증이 필요하면 `character-asset-auditor` 에이전트로 파일·레지스트리·메타 불일치를 점검합니다.

## 완전히 새로운 파츠 종류

`types.ts`에 그룹 타입과 `LAYERS` 항목(그리는 순서)을 추가하고, 필요하면 `CharacterConfig` 키, `customize.ts`의 `CATEGORY_DEFS` 탭, 서버 `product_type` 매핑(`PRODUCT_TYPE_TO_PART_KEY`)을 함께 추가합니다.
