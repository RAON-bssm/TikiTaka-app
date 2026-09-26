import { useState } from 'react';

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

function nextInList(options: string[], current: string, direction: 1 | -1): string | undefined {
  if (options.length === 0) return undefined;
  const index = options.indexOf(current);
  return options[(index + direction + options.length) % options.length];
}

/** 모양과 색상은 독립적으로 바뀌고, 앞/뒤 머리는 색상을 공유한다. */
export default function useCharacterBuilder(initial: CharacterConfig = DEFAULT_CHARACTER_CONFIG) {
  const [config, setConfig] = useState<CharacterConfig>(initial);

  // 색상 파츠는 새 모양이 현재 색상을 지원하지 않으면 첫 색상으로 보정한다.
  const setShape = (part: PartConfigKey, shapeId: string) => {
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
  };

  const setColor = (part: ColorablePart, colorId: string) => {
    setConfig((prev) => ({ ...prev, [COLORABLE_PARTS[part].colorKey]: colorId }));
  };

  const cycleShape = (part: PartConfigKey, direction: 1 | -1 = 1) => {
    const options = getShapeOptions(part);
    const nextShape = nextInList(options, config[part] ?? '', direction);
    if (nextShape !== undefined) setShape(part, nextShape);
  };

  const cycleColor = (part: ColorablePart, direction: 1 | -1 = 1) => {
    const colorKey = COLORABLE_PARTS[part].colorKey;
    const options = getColorOptions(part, config[part]);
    const nextColor = nextInList(options, config[colorKey], direction);
    if (nextColor !== undefined) setColor(part, nextColor);
  };

  const clearPart = (part: 'clothing' | 'accessory') => {
    setConfig((prev) => {
      const next = { ...prev };
      delete next[part];
      return next;
    });
  };

  const reset = () => setConfig(initial);

  return { config, setConfig, setShape, setColor, cycleShape, cycleColor, clearPart, reset };
}
