import { useCallback, useState } from 'react';

import {
  DEFAULT_CHARACTER_CONFIG,
  getColorOptions,
  getShapeOptions,
} from '@/constants/character/assets';
import {
  COLORABLE_PARTS,
  type CharacterConfig,
  type ColorablePart,
  type PartConfigKey,
} from '@/constants/character/types';

/** 순환 인덱스 계산: 현재 값 기준 direction만큼 이동한 다음 옵션. */
function nextInList(options: string[], current: string, direction: 1 | -1): string | undefined {
  if (options.length === 0) return undefined;
  const index = options.indexOf(current);
  return options[(index + direction + options.length) % options.length];
}

/**
 * 캐릭터 커스터마이징 화면의 선택 상태를 관리하는 훅.
 * 모양(shape)과 색상(color)을 독립적으로 변경할 수 있고, 앞/뒤 머리는 색상을 공유한다.
 *
 * @param initial 초기 구성 (기본값: DEFAULT_CHARACTER_CONFIG)
 */
export default function useCharacterBuilder(initial: CharacterConfig = DEFAULT_CHARACTER_CONFIG) {
  const [config, setConfig] = useState<CharacterConfig>(initial);

  /**
   * 특정 파츠의 모양을 변경한다.
   * 색상 파츠(eyes/hairBack/hairFront)는 새 모양이 현재 색상을 지원하지 않으면 첫 색상으로 보정한다.
   */
  const setShape = useCallback((part: PartConfigKey, shapeId: string) => {
    setConfig((prev) => {
      const next = { ...prev, [part]: shapeId };
      const colorable = COLORABLE_PARTS[part as ColorablePart];
      if (colorable) {
        const colors = getColorOptions(part as ColorablePart, shapeId);
        if (!colors.includes(prev[colorable.colorKey])) {
          next[colorable.colorKey] = colors[0] ?? '';
        }
      }
      return next;
    });
  }, []);

  /** 색상 파츠(eyes/hair)의 색상을 변경한다. 머리는 앞/뒤가 함께 바뀐다. */
  const setColor = useCallback((part: ColorablePart, colorId: string) => {
    setConfig((prev) => ({ ...prev, [COLORABLE_PARTS[part].colorKey]: colorId }));
  }, []);

  /** 특정 파츠의 모양을 다음/이전 옵션으로 순환한다. */
  const cycleShape = useCallback(
    (part: PartConfigKey, direction: 1 | -1 = 1) => {
      const options = getShapeOptions(part);
      const nextShape = nextInList(options, config[part] ?? '', direction);
      if (nextShape !== undefined) setShape(part, nextShape);
    },
    [config, setShape],
  );

  /** 색상 파츠(eyes/hair)의 색상을 다음/이전 옵션으로 순환한다. */
  const cycleColor = useCallback(
    (part: ColorablePart, direction: 1 | -1 = 1) => {
      const colorKey = COLORABLE_PARTS[part].colorKey;
      const options = getColorOptions(part, config[part]);
      const nextColor = nextInList(options, config[colorKey], direction);
      if (nextColor !== undefined) setColor(part, nextColor);
    },
    [config, setColor],
  );

  /** 선택 파츠(clothing/accessory)를 해제한다. */
  const clearPart = useCallback((part: 'clothing' | 'accessory') => {
    setConfig((prev) => {
      const next = { ...prev };
      delete next[part];
      return next;
    });
  }, []);

  const reset = useCallback(() => setConfig(initial), [initial]);

  return { config, setConfig, setShape, setColor, cycleShape, cycleColor, clearPart, reset };
}
