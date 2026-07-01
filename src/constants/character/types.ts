/**
 * 캐릭터 커스터마이징 관련 타입 및 레이어 정의.
 *
 * - 파츠 이미지는 모두 동일한 1:1 캔버스 기준으로 export 된 WebP(알파 채널 포함)이며,
 *   정위치에 그려져 있어 같은 크기로 겹치기만 하면 정렬이 맞는다.
 * - "모양(shape)"과 "색상(color)"을 독립 축으로 분리한다.
 *   눈/머리는 모양 그대로 색상만 바꿀 수 있어야 하므로 config에 색상 키를 따로 둔다.
 * - 앞머리(hairFront)와 뒷머리(hairBack)는 각각 독립적으로 모양을 선택하며,
 *   색상(hairColor)만 공유한다. (앞/뒤가 항상 같은 색)
 */

/** 단일 이미지 파츠 그룹 (모양 → 이미지) */
export type SimpleGroup = 'body' | 'mouth' | 'clothing' | 'accessory';
/** 모양 × 색상 파츠 그룹 (모양 → 색상 → 이미지) */
export type ColorGroup = 'eyes' | 'hairBack' | 'hairFront';
/** 실제로 화면에 그려지는 레이어(에셋 그룹). 모양을 고르는 config 키와 동일한 이름이다. */
export type AssetGroup = SimpleGroup | ColorGroup;

/** 모양을 고르는 파츠 단위 (= AssetGroup). 커스터마이징 UI의 항목들. */
export type PartConfigKey = AssetGroup;

/** 색상 축을 가진 파츠의 색상 config 키 */
export type ColorConfigKey = 'eyesColor' | 'hairColor';

/**
 * 한 캐릭터의 구성. 이미지가 아니라 이 JSON만 서버에 저장/전송한다.
 * 값은 각 파츠 에셋의 id, 예: eyes='eyes01', eyesColor='green', hairBack='bob', hairColor='brown'.
 */
export interface CharacterConfig {
  body: string;
  eyes: string; // 눈 모양 id
  eyesColor: string; // 눈 색상 id
  mouth: string;
  hairBack: string; // 뒷머리 모양 id
  hairFront: string; // 앞머리 모양 id
  hairColor: string; // 머리 색상 id (앞/뒤 공유)
  clothing?: string; // 선택 파츠
  accessory?: string; // 선택 파츠
}

/** 한 레이어를 그리는 정보. group에서 모양 id를, color가 있으면 색상 id를 읽는다. */
export interface LayerDef {
  group: AssetGroup; // 모양 id를 읽어올 config 키이자 에셋 그룹
  color?: ColorConfigKey; // 색상 id를 읽어올 config 키 (ColorGroup만 해당)
}

/**
 * 그리는 순서(아래 → 위, z-index 오름차순).
 * 순서를 바꾸고 싶으면 이 배열만 수정하면 된다.
 */
export const LAYERS: LayerDef[] = [
  { group: 'hairBack', color: 'hairColor' }, // 뒷머리 — body보다 뒤
  { group: 'body' },
  { group: 'clothing' },
  { group: 'eyes', color: 'eyesColor' },
  { group: 'mouth' },
  { group: 'hairFront', color: 'hairColor' }, // 앞머리 — body·eyes 앞
  { group: 'accessory' }, // 모자·안경 등 최상단
];

/**
 * 색상 축을 가진 파츠 → 색상 config 키. (앞/뒤 머리는 hairColor를 공유)
 * setColor / cycleColor 등에서 색상 키를 찾는 데 사용한다.
 */
export const COLORABLE_PARTS = {
  eyes: { colorKey: 'eyesColor', group: 'eyes' },
  hairBack: { colorKey: 'hairColor', group: 'hairBack' },
  hairFront: { colorKey: 'hairColor', group: 'hairFront' },
} as const satisfies Record<string, { colorKey: ColorConfigKey; group: ColorGroup }>;

export type ColorablePart = keyof typeof COLORABLE_PARTS;
