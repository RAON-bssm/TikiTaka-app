import { DEFAULT_CHARACTER_CONFIG, resolveLayerSource } from '@/constants/character/assets';
import type { CharacterConfig, LayerDef, PartConfigKey } from '@/constants/character/types';
import type { Product, ProductType } from '@/types/product';

export const SHOP_SECTIONS = ['상점', '뽑기'] as const;
export type ShopSection = (typeof SHOP_SECTIONS)[number];

export const SHOP_CATEGORIES = ['머리', '눈', '입', '코스튬'] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

/** 서버 `Product`를 화면용으로 다듬은 상점 아이템. */
export interface MarketItem {
  /** product_id 문자열화. */
  id: string;
  group: PartConfigKey;
  /**
   * `CharacterConfig`에 써 넣을 로컬 파츠 에셋 id(화면 비노출). 지금은 `name`과 출처가 같지만
   * 역할이 달라 분리해 둔다. 착용·썸네일 계산은 이 값을 쓴다.
   */
  assetId: string;
  name: string;
  description: string;
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

// TODO: 서버 연동 시 내 포인트 조회를 TanStack Query로 대체
export const USER_POINT = 99999;

// TODO: 서버가 설명 필드를 주지 않아 임시 공통 문구. 필드가 추가되면 대체
const ITEM_DESCRIPTION = '아이템 간단한 설명 아이템 간단한 설명';

/** 그리드 썸네일은 기본 캐릭터에 이 파츠 하나만 얹어 만든다(수정사항 누적 X). */
export function toMarketItem(product: Product): MarketItem {
  const group = PRODUCT_TYPE_TO_PART_KEY[product.product_type];
  const layer = Object.values(CATEGORY_PARTS).find((part) => part.group === group)?.layer ?? {
    group,
  };
  // 서버가 product_name을 에셋 id와 동일하게 내려주기로 한 계약에 기댄다.
  // 별도 에셋 필드가 생기면 이 줄만 바꾸면 된다.
  const assetId = product.product_name;
  const previewConfig: CharacterConfig = {
    ...DEFAULT_CHARACTER_CONFIG,
    [group]: assetId,
  };

  return {
    id: String(product.product_id),
    group,
    assetId,
    name: product.product_name,
    description: ITEM_DESCRIPTION,
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
  { id: 'clothing01', name: '베이직 티셔츠', part: 'clothing' },
  { id: 'clothing02', name: '스트라이프 셔츠', part: 'clothing' },
  { id: 'clothing03', name: '체크 남방', part: 'clothing' },
  { id: 'clothing04', name: '후드 집업', part: 'clothing' },
  { id: 'red-glasses', name: '빨간 안경', part: 'accessory' },
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
