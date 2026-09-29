// 꾸미기 화면의 탭/선택지 정의. 선택지는 assets 레지스트리에서 자동 생성되므로 에셋 추가 시 여기는 손대지 않는다.

import { getColorOptions, getShapeOptions, resolveLayerSource } from './assets';
import type { CharacterConfig, LayerDef, PartConfigKey } from './types';

/** 스와치 표시 색. */
export const COLOR_HEX: Record<string, string> = {
  BLACK: '#2D3748',
  BROWN: '#9a8d7f',
  BLOND: '#eee9c6',
  GREEN: '#8aed8c',
  ORANGE: '#FC8253',
  PINK: '#ef89c6',
  SKY: '#e2e9f7',
  BLUE: '#4078FF',
};

export const HAIR_COLOR_HEX: Record<string, string> = {
  PINK: '#f9d7e4',
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
  /** 모양을 고르는 파츠. 상점 상품과 맞춰 미보유 파츠를 가릴 때 쓴다. */
  group: PartConfigKey;
  buildShapes: (config: CharacterConfig) => ShapeOption[];
  /** 색상 축이 있는 파츠(머리·눈)에만 정의한다. */
  buildColors?: (config: CharacterConfig) => ColorOption[];
}

export const CATEGORY_DEFS: CategoryDef[] = [
  {
    label: '머리',
    group: 'hairBack',
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
    group: 'eyes',
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
    group: 'mouth',
    buildShapes: (c) =>
      shapeOptions('mouth', { group: 'mouth' }, c.mouth, (id) => ({ ...c, mouth: id })),
  },
  {
    label: '코스튬',
    group: 'clothing',
    buildShapes: (c) =>
      shapeOptions('clothing', { group: 'clothing' }, c.clothing ?? '', (id) => ({
        ...c,
        clothing: id,
      })),
  },
  {
    label: '몸',
    group: 'body',
    buildShapes: (c) =>
      shapeOptions('body', { group: 'body' }, c.body, (id) => ({ ...c, body: id })),
  },
  {
    label: '악세서리',
    group: 'accessory',
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
