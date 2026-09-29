import { PRODUCT_TYPE_TO_PART_KEY } from '@/constants/market';
import type { EquipRequest, Equipment } from '@/types/equipment';
import type { InventoryItem } from '@/types/inventory';
import { PRODUCT_TYPES } from '@/types/product';
import { getColorOptions } from './assets';
import { toPartId } from './legacyIds';
import type { CharacterConfig } from './types';

/**
 * 서버 색 코드는 앱 색 id와 같다. 지금 모양에 그 색 에셋이 없으면 undefined —
 * 없는 색을 넣으면 레이어가 통째로 사라지므로 base 색을 유지하게 한다.
 */
function toColorId(code: string | null | undefined, options: string[]): string | undefined {
  return code && options.includes(code) ? code : undefined;
}

export function equipmentToConfig(equipment: Equipment, base: CharacterConfig): CharacterConfig {
  const next = { ...base };
  for (const type of PRODUCT_TYPES) {
    const item = equipment[type];
    if (item) next[PRODUCT_TYPE_TO_PART_KEY[type]] = toPartId(item.product_id);
  }

  // 앞/뒷머리는 색을 공유하므로 둘 다 그 색 에셋이 있을 때만 바꾼다.
  const hairOptions = getColorOptions('hairBack', next.hairBack).filter((color) =>
    getColorOptions('hairFront', next.hairFront).includes(color),
  );
  next.hairColor = toColorId(equipment.hair_color, hairOptions) ?? next.hairColor;
  next.eyesColor =
    toColorId(equipment.eyes_color, getColorOptions('eyes', next.eyes)) ?? next.eyesColor;
  return next;
}

export function configToColorRequest(config: CharacterConfig): EquipRequest {
  return { hair_color: config.hairColor, eyes_color: config.eyesColor };
}

/**
 * config에서 보유 상품에 해당하는 파츠만 골라 착용 요청을 만든다. 바꿀 게 없으면 undefined.
 * 기본 파츠는 상품이 아니라 보낼 수 없고, 서버 API로는 벗을 수도 없어 착용만 맞춘다.
 */
export function configToEquipRequest(
  config: CharacterConfig,
  inventory: InventoryItem[],
): EquipRequest | undefined {
  const req: EquipRequest = {};
  for (const item of inventory) {
    if (item.is_active) continue;
    if (config[PRODUCT_TYPE_TO_PART_KEY[item.type]] === toPartId(item.product_id)) {
      req[item.type] = item.product_id;
    }
  }
  return Object.keys(req).length > 0 ? req : undefined;
}
