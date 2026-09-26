// 꾸미기 화면의 탭/선택지 정의. 선택지는 assets 레지스트리에서 자동 생성되므로 에셋 추가 시 여기는 손대지 않는다.

import { getColorOptions, getShapeOptions, resolveLayerSource } from './assets';
import type { CharacterConfig, LayerDef, PartConfigKey } from './types';

/** 스와치 표시 색. */
export const COLOR_HEX: Record<string, string> = {
  black: '#2D3748',
  brown: '#9a8d7f',
  blond: '#eee9c6',
  green: '#8aed8c',
  orange: '#FC8253',
  pink: '#ef89c6',
  sky: '#e2e9f7',
  blue: '#4078FF',
};

/** 같은 색 id라도 머리는 톤이 달라(pink 등) 덮어쓴다. 없는 색은 COLOR_HEX로 폴백. */
export const HAIR_COLOR_HEX: Record<string, string> = {
  pink: '#f9d7e4',
};

function resolveHex(id: string, override?: Record<string, string>): string {
  return override?.[id] ?? COLOR_HEX[id] ?? '#DDE2EC';
}

/** next는 선택했을 때 반영할 config. */
interface Option {
  id: string;
  active: boolean;
  next: CharacterConfig;
}

export interface ShapeOption extends Option {
  source: number | undefined;
}

export interface ColorOption extends Option {
  hex: string;
}

/** deselect가 있으면(악세서리) 선택된 항목을 다시 눌렀을 때 벗는다. */
function shapeOptions(
  group: PartConfigKey,
  layer: LayerDef,
  currentId: string,
  apply: (id: string) => CharacterConfig,
  deselect?: () => CharacterConfig,
): ShapeOption[] {
  return getShapeOptions(group).map((id) => {
    const active = currentId === id;
    const next = active && deselect ? deselect() : apply(id);
    return { id, source: resolveLayerSource(apply(id), layer), active, next };
  });
}

function colorOptions(
  ids: string[],
  currentId: string,
  apply: (id: string) => CharacterConfig,
  hexOverride?: Record<string, string>,
): ColorOption[] {
  return ids.map((id) => ({
    id,
    active: currentId === id,
    next: apply(id),
    hex: resolveHex(id, hexOverride),
  }));
}

export interface CategoryDef {
  label: string;
  buildShapes: (config: CharacterConfig) => ShapeOption[];
  /** 색상 축이 있는 파츠(머리·눈)에만 정의한다. */
  buildColors?: (config: CharacterConfig) => ColorOption[];
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    label: '머리',
    buildShapes: (c) =>
      shapeOptions('hairBack', { group: 'hairBack', color: 'hairColor' }, c.hairBack, (id) => ({
        ...c,
        hairBack: id,
      })),
    buildColors: (c) =>
      colorOptions(
        getColorOptions('hairBack', c.hairBack),
        c.hairColor,
        (id) => ({ ...c, hairColor: id }),
        HAIR_COLOR_HEX,
      ),
  },
  {
    label: '눈',
    buildShapes: (c) =>
      shapeOptions('eyes', { group: 'eyes', color: 'eyesColor' }, c.eyes, (id) => ({
        ...c,
        eyes: id,
      })),
    buildColors: (c) =>
      colorOptions(getColorOptions('eyes', c.eyes), c.eyesColor, (id) => ({
        ...c,
        eyesColor: id,
      })),
  },
  {
    label: '입',
    buildShapes: (c) =>
      shapeOptions('mouth', { group: 'mouth' }, c.mouth, (id) => ({ ...c, mouth: id })),
  },
  {
    label: '코스튬',
    buildShapes: (c) =>
      shapeOptions('clothing', { group: 'clothing' }, c.clothing ?? '', (id) => ({
        ...c,
        clothing: id,
      })),
  },
  {
    label: '몸',
    buildShapes: (c) =>
      shapeOptions('body', { group: 'body' }, c.body, (id) => ({ ...c, body: id })),
  },
  {
    label: '악세서리',
    buildShapes: (c) =>
      shapeOptions(
        'accessory',
        { group: 'accessory' },
        c.accessory ?? '',
        (id) => ({ ...c, accessory: id }),
        () => ({ ...c, accessory: undefined }),
      ),
  },
];
