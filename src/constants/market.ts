import { DEFAULT_CHARACTER_CONFIG, resolveLayerSource } from '@/constants/character/assets';
import { toPartId } from '@/constants/character/legacyIds';
import type { CharacterConfig, LayerDef, PartConfigKey } from '@/constants/character/types';
import type { Product, ProductType } from '@/types/product';

export const SHOP_SECTIONS = ['상점', '뽑기'] as const;
export type ShopSection = (typeof SHOP_SECTIONS)[number];

export const SHOP_CATEGORIES = ['머리', '눈', '입', '코스튬'] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

/** 서버 `Product`를 화면용으로 다듬은 상점 아이템. */
export interface MarketItem {
  /** 서버 product_id. `assetId`와 값은 같지만 서버에 보낼 때는 이 값을 쓴다. */
  id: string;
  group: PartConfigKey;
  /**
   * `CharacterConfig`에 써 넣을 로컬 파츠 에셋 id(화면 비노출). 지금은 `name`과 출처가 같지만
   * 역할이 달라 분리해 둔다. 착용·썸네일 계산은 이 값을 쓴다.
   */
  assetId: string;
  name: string;
  description?: string;
  price: number;
  /** 매핑된 에셋이 없으면 undefined. */
  gridSource: number | undefined;
}

/** 썸네일 렌더링용 카테고리 → 파츠 그룹/레이어 매핑. */
const CATEGORY_PARTS: Record<ShopCategory, { group: PartConfigKey; layer: LayerDef }> = {
  머리: { group: 'hairBack', layer: { group: 'hairBack', color: 'hairColor' } },
  눈: { group: 'eyes', layer: { group: 'eyes', color: 'eyesColor' } },
  입: { group: 'mouth', layer: { group: 'mouth' } },
  코스튬: { group: 'clothing', layer: { group: 'clothing' } },
};

/** 서버 `product_type`(snake_case) → `PartConfigKey`(camelCase). 이름 규칙만 다르다. */
export const PRODUCT_TYPE_TO_PART_KEY: Record<ProductType, PartConfigKey> = {
  body: 'body',
  accessory: 'accessory',
  clothing: 'clothing',
  eyes: 'eyes',
  hair_front: 'hairFront',
  hair_back: 'hairBack',
  mouth: 'mouth',
};

export const CATEGORY_TO_PRODUCT_TYPE: Record<ShopCategory, ProductType> = {
  머리: 'hair_back',
  눈: 'eyes',
  입: 'mouth',
  코스튬: 'clothing',
};

/** 그리드 썸네일은 기본 캐릭터에 이 파츠 하나만 얹어 만든다(수정사항 누적 X). */
export function toMarketItem(product: Product): MarketItem {
  const group = PRODUCT_TYPE_TO_PART_KEY[product.product_type];
  const layer = Object.values(CATEGORY_PARTS).find((part) => part.group === group)?.layer ?? {
    group,
  };
  // 서버가 product_id를 에셋 id와 동일하게 내려주기로 한 계약에 기댄다.
  const assetId = toPartId(product.product_id);
  const previewConfig: CharacterConfig = {
    ...DEFAULT_CHARACTER_CONFIG,
    [group]: assetId,
  };

  return {
    id: product.product_id,
    group,
    assetId,
    name: product.product_name,
    description: product.product_description,
    price: product.price,
    gridSource: resolveLayerSource(previewConfig, layer),
  };
}

// ──────────────────────────── 뽑기 (가챠) ────────────────────────────

export const GOTCHA_COSTS = {
  single: 500,
  multi: 2500,
} as const;

/** id는 캐릭터 파츠 에셋 id와 동일하다. */
export interface GotchaItem {
  id: string;
  name: string;
  part: 'clothing' | 'accessory';
}

export interface GotchaPull {
  item: GotchaItem;
  preview: CharacterConfig;
}

// TODO: 서버 연동 시 아이템 풀/확률은 API 응답으로 대체
const GOTCHA_ITEM_POOL: GotchaItem[] = [
  { id: 'clothing-01', name: '베이직 티셔츠', part: 'clothing' },
  { id: 'clothing-02', name: '스트라이프 셔츠', part: 'clothing' },
  { id: 'clothing-03', name: '체크 남방', part: 'clothing' },
  { id: 'clothing-04', name: '후드 집업', part: 'clothing' },
  { id: 'accessory-red-glasses', name: '빨간 안경', part: 'accessory' },
];

function pullOne(): GotchaPull {
  const item = GOTCHA_ITEM_POOL[Math.floor(Math.random() * GOTCHA_ITEM_POOL.length)];
  return {
    item,
    // TODO: 유저의 실제 캐릭터 config를 받아오면 그걸 기반으로 교체
    preview: { ...DEFAULT_CHARACTER_CONFIG, [item.part]: item.id },
  };
}

export function pullGotcha(count: 1 | 5): GotchaPull[] {
  return Array.from({ length: count }, pullOne);
}
