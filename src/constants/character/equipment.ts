import { PRODUCT_TYPE_TO_PART_KEY } from '@/constants/market';
import type { EquipRequest, Equipment } from '@/types/equipment';
import type { InventoryItem } from '@/types/inventory';
import { PRODUCT_TYPES } from '@/types/product';
import { toPartId } from './legacyIds';
import type { CharacterConfig } from './types';

/** 서버는 모양만 알고 색은 모르므로, 착용 슬롯의 모양만 base 위에 덮는다. */
export function equipmentToConfig(equipment: Equipment, base: CharacterConfig): CharacterConfig {
  const next = { ...base };
  for (const type of PRODUCT_TYPES) {
    const item = equipment[type];
    if (item) next[PRODUCT_TYPE_TO_PART_KEY[type]] = toPartId(item.product_id);
  }
  return next;
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
