import { PART_META } from './partMeta';
import {
  COLORABLE_PARTS,
  type CharacterConfig,
  type ColorablePart,
  type ColorGroup,
  type LayerDef,
  type PartConfigKey,
  type SimpleGroup,
  type TintGroup,
} from './types';

// Metro는 동적 경로 require를 지원하지 않아 에셋을 여기에 직접 매핑한다. 매핑하지 않은 에셋은 안 보인다.
// id = 폴더/파일명(확장자 제외). 단 **색상 id만 서버 색 코드와 같은 대문자**다(파일명은 소문자, `black.webp` → `BLACK`).
// 에셋 추가 후 `pnpm generate:part-meta`로 partMeta.ts를 재생성한다.

/** `assets/character/<그룹>/<모양>.webp` */
const SIMPLE_ASSETS: Record<SimpleGroup, Record<string, number>> = {
  body: {
    'body-01': require('@/assets/character/body/body-01.webp'),
    'body-02': require('@/assets/character/body/body-02.webp'),
  },
  mouth: {
    'mouth-01': require('@/assets/character/mouth/mouth-01.webp'),
    'mouth-02': require('@/assets/character/mouth/mouth-02.webp'),
  },
  clothing: {
    'clothing-01': require('@/assets/character/clothing/clothing-01.webp'),
    'clothing-02': require('@/assets/character/clothing/clothing-02.webp'),
    'clothing-03': require('@/assets/character/clothing/clothing-03.webp'),
    'clothing-04': require('@/assets/character/clothing/clothing-04.webp'),
    'clothing-05': require('@/assets/character/clothing/clothing-05.webp'),
    'clothing-06': require('@/assets/character/clothing/clothing-06.webp'),
  },
  accessory: {
    'accessory-red-glasses': require('@/assets/character/accessory/accessory-red-glasses.webp'),
    'accessory-red-glasses-hair-pin': require('@/assets/character/accessory/accessory-red-glasses-hair-pin.webp'),
    'accessory-plaster': require('@/assets/character/accessory/accessory-plaster.webp'),
    'accessory-glasses': require('@/assets/character/accessory/accessory-glasses.webp'),
  },
};

/** `assets/character/<그룹>/<모양>/<색상>.webp` */
const COLOR_ASSETS: Record<ColorGroup, Record<string, Record<string, number>>> = {
  eyes: {
    'eyes-01': {
      GREEN: require('@/assets/character/eyes/eyes-01/green.webp'),
      ORANGE: require('@/assets/character/eyes/eyes-01/orange.webp'),
      PINK: require('@/assets/character/eyes/eyes-01/pink.webp'),
      SKY: require('@/assets/character/eyes/eyes-01/sky.webp'),
      BLUE: require('@/assets/character/eyes/eyes-01/blue.webp'),
    },
  },
  hairBack: {
    'hair-back-bob': {
      BLACK: require('@/assets/character/hair-back/hair-back-bob/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-bob/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-bob/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-bob/pink.webp'),
    },
    'hair-back-long': {
      BLACK: require('@/assets/character/hair-back/hair-back-long/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-long/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-long/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-long/pink.webp'),
    },
    'hair-back-puff': {
      BLACK: require('@/assets/character/hair-back/hair-back-puff/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-puff/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-puff/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-puff/pink.webp'),
    },
    'hair-back-short': {
      BLACK: require('@/assets/character/hair-back/hair-back-short/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-short/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-short/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-short/pink.webp'),
    },
    'hair-back-side-bob': {
      BLACK: require('@/assets/character/hair-back/hair-back-side-bob/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-side-bob/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-side-bob/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-side-bob/pink.webp'),
    },
    'hair-back-side-tail': {
      BLACK: require('@/assets/character/hair-back/hair-back-side-tail/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-side-tail/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-side-tail/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-side-tail/pink.webp'),
    },
    'hair-back-low-tail': {
      BLACK: require('@/assets/character/hair-back/hair-back-low-tail/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-low-tail/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-low-tail/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-low-tail/pink.webp'),
    },
    'hair-back-low-pigtails': {
      BLACK: require('@/assets/character/hair-back/hair-back-low-pigtails/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-low-pigtails/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-low-pigtails/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-low-pigtails/pink.webp'),
    },
    'hair-back-side-wave': {
      BLACK: require('@/assets/character/hair-back/hair-back-side-wave/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-side-wave/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-side-wave/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-side-wave/pink.webp'),
    },
    'hair-back-wave': {
      BLACK: require('@/assets/character/hair-back/hair-back-wave/black.webp'),
      BLOND: require('@/assets/character/hair-back/hair-back-wave/blond.webp'),
      BROWN: require('@/assets/character/hair-back/hair-back-wave/brown.webp'),
      PINK: require('@/assets/character/hair-back/hair-back-wave/pink.webp'),
    },
  },
  hairFront: {
    'hair-front-basic': {
      BLACK: require('@/assets/character/hair-front/hair-front-basic/black.webp'),
      BLOND: require('@/assets/character/hair-front/hair-front-basic/blond.webp'),
      BROWN: require('@/assets/character/hair-front/hair-front-basic/brown.webp'),
      PINK: require('@/assets/character/hair-front/hair-front-basic/pink.webp'),
    },
  },
};

/** `assets/character/<그룹>/<색상>.webp` (모양 없음) */
const TINT_ASSETS: Record<TintGroup, Record<string, number>> = {
  hairHighlights: {
    GREEN: require('@/assets/character/hair-highlights/green.webp'),
    ORANGE: require('@/assets/character/hair-highlights/orange.webp'),
    PINK: require('@/assets/character/hair-highlights/pink.webp'),
    SKY: require('@/assets/character/hair-highlights/sky.webp'),
    BLUE: require('@/assets/character/hair-highlights/blue.webp'),
  },
};

const COLOR_GROUPS = new Set<ColorGroup>(['eyes', 'hairBack', 'hairFront']);

/** 매핑이 없으면 undefined(해당 레이어 skip). */
export function resolveLayerSource(config: CharacterConfig, layer: LayerDef): number | undefined {
  if ('tint' in layer) {
    const colorId = config[layer.color];
    if (!colorId) return undefined;
    return TINT_ASSETS[layer.tint]?.[colorId];
  }

  const shapeId = config[layer.group];
  if (!shapeId) return undefined;

  if (layer.color) {
    const colorId = config[layer.color];
    if (!colorId) return undefined;
    return COLOR_ASSETS[layer.group as ColorGroup]?.[shapeId]?.[colorId];
  }
  return SIMPLE_ASSETS[layer.group as SimpleGroup]?.[shapeId];
}

export function getShapeOptions(part: PartConfigKey): string[] {
  const registry = COLOR_GROUPS.has(part as ColorGroup)
    ? COLOR_ASSETS[part as ColorGroup]
    : SIMPLE_ASSETS[part as SimpleGroup];
  return Object.keys(registry);
}

export function getColorOptions(part: ColorablePart, shapeId: string): string[] {
  const shapes = COLOR_ASSETS[COLORABLE_PARTS[part].group];
  return Object.keys(shapes[shapeId] ?? {});
}

/** 홈 배너(`banner.ts`) 캐릭터와 같은 구성. */
export const DEFAULT_CHARACTER_CONFIG: CharacterConfig = {
  body: 'body-02',
  eyes: 'eyes-01',
  eyesColor: 'ORANGE',
  mouth: 'mouth-01',
  hairBack: 'hair-back-long',
  hairFront: 'hair-front-basic',
  hairColor: 'BLACK',
  clothing: 'clothing-01', // 코스튬은 항상 착용 상태 — 벗을 수 없다
};

export type PartMeta = (typeof PART_META)[keyof typeof PART_META];

// 그룹명(camelCase) → 에셋 폴더명(kebab-case). PART_META 키가 폴더 경로 기준이다.
const toKebab = (value: string) => value.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);

let sourceMetaMap: Map<number, PartMeta> | null = null;

function buildSourceMetaMap(): Map<number, PartMeta> {
  const map = new Map<number, PartMeta>();

  const register = (source: number, key: string) => {
    const meta = (PART_META as Record<string, PartMeta | undefined>)[key];
    if (meta) map.set(source, meta);
  };

  for (const [group, shapes] of Object.entries(SIMPLE_ASSETS)) {
    for (const [shape, source] of Object.entries(shapes)) {
      register(source, `${toKebab(group)}/${shape}`);
    }
  }

  for (const [group, shapes] of Object.entries(COLOR_ASSETS)) {
    for (const [shape, colors] of Object.entries(shapes)) {
      for (const [color, source] of Object.entries(colors)) {
        register(source, `${toKebab(group)}/${shape}/${color.toLowerCase()}`);
      }
    }
  }

  for (const [group, colors] of Object.entries(TINT_ASSETS)) {
    for (const [color, source] of Object.entries(colors)) {
      register(source, `${toKebab(group)}/${color.toLowerCase()}`);
    }
  }

  return map;
}

/** require 소스 번호로 파츠 메타를 찾는다. */
export function getPartMeta(source: number | undefined): PartMeta | undefined {
  if (source == null) return undefined;
  if (!sourceMetaMap) sourceMetaMap = buildSourceMetaMap();
  return sourceMetaMap.get(source);
}
