import {
  COLORABLE_PARTS,
  type CharacterConfig,
  type ColorablePart,
  type ColorGroup,
  type LayerDef,
  type PartConfigKey,
  type SimpleGroup,
} from './types';

/**
 * 파츠 에셋 정적 레지스트리.
 *
 * React Native/Metro는 동적 경로 require를 지원하지 않으므로, id ↔ 에셋을 여기에 직접 매핑한다.
 *
 * 규칙
 * - id = 폴더/파일명 (확장자 제외).
 * - 단일 파츠(SIMPLE_ASSETS): `assets/character/<그룹>/<모양>.webp` → `{ '<모양>': require(...) }`.
 * - 색상 파츠(COLOR_ASSETS): `assets/character/<그룹>/<모양>/<색상>.webp`
 *   → `{ '<모양>': { '<색상>': require(...) } }`.
 * - 앞머리(hair-front)와 뒷머리(hair-back)는 독립 모양이지만 색상 키(black/blond/brown)는 맞춘다.
 *   → CharacterConfig.hairColor 하나로 앞/뒤가 같은 색으로 렌더된다.
 */

/** 단일 이미지 파츠: 그룹 → 모양 → 이미지 */
const SIMPLE_ASSETS: Record<SimpleGroup, Record<string, number>> = {
  body: {
    body01: require('@/assets/character/body/body01.webp'),
    body02: require('@/assets/character/body/body02.webp'),
  },
  mouth: {
    mouth01: require('@/assets/character/mouth/mouth01.webp'),
    mouth02: require('@/assets/character/mouth/mouth02.webp'),
  },
  clothing: {
    clothing01: require('@/assets/character/clothing/clothing01.webp'),
    clothing02: require('@/assets/character/clothing/clothing02.webp'),
    clothing03: require('@/assets/character/clothing/clothing03.webp'),
    clothing04: require('@/assets/character/clothing/clothing04.webp'),
  },
  accessory: {
    'red-glasses': require('@/assets/character/accessory/red-glasses.webp'),
  },
};

/** 색상 파츠: 그룹 → 모양 → 색상 → 이미지 */
const COLOR_ASSETS: Record<ColorGroup, Record<string, Record<string, number>>> = {
  eyes: {
    eyes01: {
      green: require('@/assets/character/eyes/eyes01/green.webp'),
      orange: require('@/assets/character/eyes/eyes01/orange.webp'),
      pink: require('@/assets/character/eyes/eyes01/pink.webp'),
      sky: require('@/assets/character/eyes/eyes01/sky.webp'),
    },
  },
  hairBack: {
    bob: {
      black: require('@/assets/character/hair-back/bob/black.webp'),
      blond: require('@/assets/character/hair-back/bob/blond.webp'),
      brown: require('@/assets/character/hair-back/bob/brown.webp'),
    },
    long: {
      black: require('@/assets/character/hair-back/long/black.webp'),
      blond: require('@/assets/character/hair-back/long/blond.webp'),
      brown: require('@/assets/character/hair-back/long/brown.webp'),
    },
    puff: {
      black: require('@/assets/character/hair-back/puff/black.webp'),
      blond: require('@/assets/character/hair-back/puff/blond.webp'),
      brown: require('@/assets/character/hair-back/puff/brown.webp'),
    },
    short: {
      black: require('@/assets/character/hair-back/short/black.webp'),
      blond: require('@/assets/character/hair-back/short/blond.webp'),
      brown: require('@/assets/character/hair-back/short/brown.webp'),
    },
  },
  hairFront: {
    basic: {
      black: require('@/assets/character/hair-front/basic/black.webp'),
      blond: require('@/assets/character/hair-front/basic/blond.webp'),
      brown: require('@/assets/character/hair-front/basic/brown.webp'),
    },
  },
};

const COLOR_GROUPS = new Set<ColorGroup>(['eyes', 'hairBack', 'hairFront']);

/** 한 레이어의 이미지 소스를 config로부터 해석한다. 없으면 undefined (해당 레이어 skip). */
export function resolveLayerSource(config: CharacterConfig, layer: LayerDef): number | undefined {
  const shapeId = config[layer.group];
  if (!shapeId) return undefined;

  if (layer.color) {
    const colorId = config[layer.color];
    if (!colorId) return undefined;
    return COLOR_ASSETS[layer.group as ColorGroup]?.[shapeId]?.[colorId];
  }
  return SIMPLE_ASSETS[layer.group as SimpleGroup]?.[shapeId];
}

/** 특정 파츠의 선택 가능한 모양 id 목록. */
export function getShapeOptions(part: PartConfigKey): string[] {
  const registry = COLOR_GROUPS.has(part as ColorGroup)
    ? COLOR_ASSETS[part as ColorGroup]
    : SIMPLE_ASSETS[part as SimpleGroup];
  return Object.keys(registry);
}

/** 색상 파츠(eyes/hairBack/hairFront)에서 특정 모양이 가진 색상 id 목록. */
export function getColorOptions(part: ColorablePart, shapeId: string): string[] {
  const shapes = COLOR_ASSETS[COLORABLE_PARTS[part].group];
  return Object.keys(shapes[shapeId] ?? {});
}

/**
 * 등록된 에셋 중 각 파츠의 첫 옵션으로 구성한 기본 캐릭터.
 * 아직 에셋이 없는 파츠는 빈 문자열이 되며, Character 컴포넌트에서 자동 skip 된다.
 */
function firstShape(part: PartConfigKey): string {
  return getShapeOptions(part)[0] ?? '';
}
function firstColor(part: ColorablePart): string {
  return getColorOptions(part, firstShape(part))[0] ?? '';
}

export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  body: firstShape('body'),
  eyes: firstShape('eyes'),
  eyesColor: firstColor('eyes'),
  mouth: firstShape('mouth'),
  hairBack: firstShape('hairBack'),
  hairFront: firstShape('hairFront'),
  hairColor: firstColor('hairFront'),
};
