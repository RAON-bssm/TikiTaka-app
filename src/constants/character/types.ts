// 파츠 이미지는 모두 같은 1:1 캔버스에 정위치 export 되어, 같은 크기로 겹치기만 하면 정렬이 맞는다.
// 모양(shape)과 색상(color)은 독립 축이다.

/** 모양 → 이미지 */
export type SimpleGroup = 'body' | 'mouth' | 'clothing' | 'accessory';
/** 모양 → 색상 → 이미지 */
export type ColorGroup = 'eyes' | 'hairBack' | 'hairFront';
/** 색상 → 이미지 (모양 없음) */
export type TintGroup = 'hairHighlights';
/** 에셋 그룹명은 모양을 고르는 config 키와 같다. */
export type AssetGroup = SimpleGroup | ColorGroup;

export type PartConfigKey = AssetGroup;

export type ColorConfigKey = 'eyesColor' | 'hairColor';

/** 이미지가 아니라 이 JSON(파츠 에셋 id들)만 서버에 저장/전송한다. */
export interface CharacterConfig {
  body: string;
  eyes: string;
  eyesColor: string;
  mouth: string;
  hairBack: string;
  hairFront: string;
  hairColor: string; // 앞/뒤 머리 공유
  clothing?: string;
  accessory?: string;
}

export interface ShapeLayerDef {
  group: AssetGroup;
  color?: ColorConfigKey; // ColorGroup만 해당
}

export interface TintLayerDef {
  tint: TintGroup;
  color: ColorConfigKey;
}

export type LayerDef = ShapeLayerDef | TintLayerDef;

/** 그리는 순서(아래 → 위). 순서 변경은 이 배열만 수정한다. */
export const LAYERS: LayerDef[] = [
  { group: 'hairBack', color: 'hairColor' },
  { group: 'body' },
  { group: 'clothing' },
  { group: 'eyes', color: 'eyesColor' },
  { group: 'mouth' },
  { group: 'hairFront', color: 'hairColor' },
  { group: 'accessory' },
  { tint: 'hairHighlights', color: 'eyesColor' }, // 눈 색에 맞춘 머리 하이라이트
];

/** 색상 축을 가진 파츠 → 색상 config 키. */
export const COLORABLE_PARTS = {
  eyes: { colorKey: 'eyesColor', group: 'eyes' },
  hairBack: { colorKey: 'hairColor', group: 'hairBack' },
  hairFront: { colorKey: 'hairColor', group: 'hairFront' },
} as const satisfies Record<string, { colorKey: ColorConfigKey; group: ColorGroup }>;

export type ColorablePart = keyof typeof COLORABLE_PARTS;
