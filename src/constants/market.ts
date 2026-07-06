import {
  DEFAULT_CHARACTER_CONFIG,
  getShapeOptions,
  resolveLayerSource,
} from '@/constants/character/assets';
import type { CharacterConfig, LayerDef, PartConfigKey } from '@/constants/character/types';

/** 상점 상단 섹션 (구매 / 뽑기). */
export const SHOP_SECTIONS = ['상점', '뽑기'] as const;
export type ShopSection = (typeof SHOP_SECTIONS)[number];

/** 꾸미기 아이템 카테고리. 캐릭터 꾸미기의 파츠 카테고리와 대응된다. */
export const SHOP_CATEGORIES = ['머리', '눈', '입', '코스튬'] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

/** 그리드에 표시되는 개별 상점 아이템 (실제 캐릭터 파츠). */
export interface ShopItem {
  /** 파츠 id (예: 'bob', 'eyes01'). */
  id: string;
  /** 구매에 필요한 포인트. */
  price: number;
  /** 파츠 썸네일 이미지 소스 (require id). 매핑된 에셋이 없으면 undefined. */
  source: number | undefined;
}

/** 상점 카테고리 → 캐릭터 파츠 그룹/레이어 매핑. 썸네일과 아이템 목록을 이 정의로 만든다. */
const CATEGORY_PARTS: Record<ShopCategory, { group: PartConfigKey; layer: LayerDef }> = {
  머리: { group: 'hairBack', layer: { group: 'hairBack', color: 'hairColor' } },
  눈: { group: 'eyes', layer: { group: 'eyes', color: 'eyesColor' } },
  입: { group: 'mouth', layer: { group: 'mouth' } },
  코스튬: { group: 'clothing', layer: { group: 'clothing' } },
};

/** 상단에 크게 노출되는 추천/선택 아이템. */
export interface FeaturedShopItem {
  name: string;
  description: string;
  /** 구매에 필요한 포인트. */
  price: number;
  /** 미리보기로 합성해 보여줄 캐릭터 구성. */
  character: CharacterConfig;
}

/** 보유 포인트. */
// TODO: 서버 연동 시 TanStack Query로 대체 (내 포인트)
export const USER_POINT = 99999;

// TODO: 서버 연동 시 TanStack Query로 대체 (추천 아이템)
export const FEATURED_ITEM: FeaturedShopItem = {
  name: '꾸미기 아이템 이름',
  description: '아이템 간단한 설명 아이템 간단한 설명',
  price: 500,
  character: DEFAULT_CHARACTER_CONFIG,
};

/**
 * 카테고리별 판매 아이템 목록을 실제 파츠 에셋에서 만든다.
 *
 * 각 파츠 id를 기본 캐릭터에 적용해 해당 레이어 썸네일을 뽑는다.
 * (커스터마이저의 파츠 선택 그리드와 동일한 방식)
 */
// TODO: 서버 연동 시 가격/보유 여부를 서버 데이터로 대체 (구매/미구매 분리)
export function getShopItems(category: ShopCategory): ShopItem[] {
  const { group, layer } = CATEGORY_PARTS[category];
  return getShapeOptions(group).map((id) => {
    const config: CharacterConfig = { ...DEFAULT_CHARACTER_CONFIG, [group]: id };
    return { id, price: 500, source: resolveLayerSource(config, layer) };
  });
}
