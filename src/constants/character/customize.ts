/**
 * 캐릭터 꾸미기 화면의 카테고리/선택지 정의.
 *
 * 화면(character.tsx)은 이 정의를 받아 렌더만 하고, "어떤 파츠를 어떤 순서로,
 * 어떤 선택지로 보여줄지"는 여기서 데이터로 관리한다. 파츠 에셋이 늘어나면
 * assets 레지스트리만 채우면 이 정의가 자동으로 선택지를 만들어낸다.
 */

import { getColorOptions, getShapeOptions, resolveLayerSource } from './assets';
import type { CharacterConfig, LayerDef, PartConfigKey } from './types';

/** 색상 스와치 미리보기용 색상 id → 표시 색(hex). 없으면 회색으로 대체한다. */
export const COLOR_HEX: Record<string, string> = {
  black: '#2D3748',
  brown: '#9a8d7f',
  blond: '#eee9c6',
  green: '#8aed8c',
  orange: '#FC8253',
  pink: '#ef89c6',
  sky: '#e2e9f7',
};

/** 선택지 공통 필드. next는 선택했을 때 반영할 config. */
interface Option {
  id: string;
  active: boolean;
  next: CharacterConfig;
}

/** 모양 선택지 (그리드). 실제 파츠 에셋 썸네일(source)을 렌더한다. */
export interface ShapeOption extends Option {
  source: number | undefined;
}

/** 색상 선택지 (스와치). 단색 원으로 표시하므로 이미지가 필요 없다. */
export type ColorOption = Option;

/**
 * 모양 선택지 목록을 만든다.
 * apply(id)로 해당 파츠만 교체한 config를 만들고, 그 config로 썸네일을 합성한다.
 */
function shapeOptions(
  group: PartConfigKey,
  layer: LayerDef,
  currentId: string,
  apply: (id: string) => CharacterConfig,
): ShapeOption[] {
  return getShapeOptions(group).map((id) => {
    const next = apply(id);
    return { id, source: resolveLayerSource(next, layer), active: currentId === id, next };
  });
}

/** 색상 선택지 목록을 만든다. */
function colorOptions(
  ids: string[],
  currentId: string,
  apply: (id: string) => CharacterConfig,
): ColorOption[] {
  return ids.map((id) => ({ id, active: currentId === id, next: apply(id) }));
}

/**
 * 카테고리 탭 정의.
 * - buildShapes: 모양 선택지 (그리드)
 * - buildColors: 색상 선택지 (스와치). 색상 축이 있는 파츠(머리·눈)에만 정의한다.
 */
export interface CategoryDef {
  label: string;
  buildShapes: (config: CharacterConfig) => ShapeOption[];
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
      colorOptions(getColorOptions('hairBack', c.hairBack), c.hairColor, (id) => ({
        ...c,
        hairColor: id,
      })),
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
      shapeOptions('accessory', { group: 'accessory' }, c.accessory ?? '', (id) => ({
        ...c,
        accessory: id,
      })),
  },
];
