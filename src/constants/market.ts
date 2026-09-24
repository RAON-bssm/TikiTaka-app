import { DEFAULT_CHARACTER_CONFIG, resolveLayerSource } from '@/constants/character/assets';
import type { CharacterConfig, LayerDef, PartConfigKey } from '@/constants/character/types';
import type { Product, ProductType } from '@/types/product';

/** 상점 상단 섹션 (구매 / 뽑기). */
export const SHOP_SECTIONS = ['상점', '뽑기'] as const;
export type ShopSection = (typeof SHOP_SECTIONS)[number];

/** 꾸미기 아이템 카테고리. 캐릭터 꾸미기의 파츠 카테고리와 대응된다. */
export const SHOP_CATEGORIES = ['머리', '눈', '입', '코스튬'] as const;
export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

/** 그리드에 표시되는 개별 상점 아이템. `Product`를 화면이 쓰기 좋은 형태로 다듬은 것. */
export interface MarketItem {
  /** 선택 상태 비교용 id (product_id 문자열화). */
  id: string;
  /** 이 아이템이 착용되는 캐릭터 파츠 그룹 (착용 시 config의 어느 키를 바꿀지). */
  group: PartConfigKey;
  /**
   * `CharacterConfig`에 써 넣을 **로컬 파츠 에셋 id**. 화면에 노출하지 않는다.
   * 표시용은 `name`을 쓴다 — 지금은 두 값의 출처가 같지만 역할이 달라 분리해 둔다.
   */
  assetId: string;
  /** 화면에 보여줄 이름. 착용·썸네일 계산에는 쓰지 않는다(`assetId` 사용). */
  name: string;
  /** 아이템 설명. */
  description: string;
  /** 구매에 필요한 포인트. */
  price: number;
  /** 그리드 썸네일 이미지 소스 (require id). 매핑된 에셋이 없으면 undefined. */
  gridSource: number | undefined;
}

/** 상점 카테고리 → 캐릭터 파츠 그룹/레이어 매핑. 썸네일 렌더링에 쓴다. */
const CATEGORY_PARTS: Record<ShopCategory, { group: PartConfigKey; layer: LayerDef }> = {
  머리: { group: 'hairBack', layer: { group: 'hairBack', color: 'hairColor' } },
  눈: { group: 'eyes', layer: { group: 'eyes', color: 'eyesColor' } },
  입: { group: 'mouth', layer: { group: 'mouth' } },
  코스튬: { group: 'clothing', layer: { group: 'clothing' } },
};

/**
 * 서버 `product_type`(snake_case) → 클라이언트 `PartConfigKey`(camelCase) 변환.
 * 값 자체는 같은 의미이고 이름 규칙만 다르다(AGENTS.md 7.3 참고).
 */
export const PRODUCT_TYPE_TO_PART_KEY: Record<ProductType, PartConfigKey> = {
  body: 'body',
  accessory: 'accessory',
  clothing: 'clothing',
  eyes: 'eyes',
  hair_front: 'hairFront',
  hair_back: 'hairBack',
  mouth: 'mouth',
};

/** 상점 카테고리 → 서버 product_type. 카테고리 탭으로 상품 목록을 걸러낼 때 쓴다. */
export const CATEGORY_TO_PRODUCT_TYPE: Record<ShopCategory, ProductType> = {
  머리: 'hair_back',
  눈: 'eyes',
  입: 'mouth',
  코스튬: 'clothing',
};

/** 보유 포인트. */
// TODO: 서버 연동 시 TanStack Query로 대체 (내 포인트) — 이번 작업 범위는 product/inventory까지라 보류
export const USER_POINT = 99999;

/** 아이템 설명 (서버가 설명 필드를 내려주지 않아 임시 공통 문구). */
// TODO: 서버 응답에 설명 필드가 추가되면 실제 설명으로 대체
const ITEM_DESCRIPTION = '아이템 간단한 설명 아이템 간단한 설명';

/**
 * 서버 `Product`를 화면용 `MarketItem`으로 변환한다.
 * 그리드 썸네일은 항상 기본 캐릭터 기준으로 이 파츠 하나만 얹어서 만든다(수정사항 누적 X).
 */
export function toMarketItem(product: Product): MarketItem {
  const group = PRODUCT_TYPE_TO_PART_KEY[product.product_type];
  const layer = Object.values(CATEGORY_PARTS).find((part) => part.group === group)?.layer ?? {
    group,
  };
  // 서버가 product_name을 클라이언트 파츠 에셋 id와 동일하게 내려주기로 한 계약에 기댄다.
  // 서버가 별도 에셋 필드를 주게 되면 이 한 줄만 바꾸면 된다.
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

/** 뽑기 비용 (포인트). */
export const GOTCHA_COSTS = {
  single: 500,
  multi: 2500,
} as const;

/** 가챠로 획득 가능한 꾸미기 아이템. id는 캐릭터 파츠 에셋 id와 동일하다. */
export interface GotchaItem {
  id: string;
  name: string;
  /** 캐릭터에 착용되는 파츠 그룹 */
  part: 'clothing' | 'accessory';
}

/** 한 번의 뽑기 결과. 아이템 + 착용 미리보기용 캐릭터 구성. */
export interface GotchaPull {
  item: GotchaItem;
  preview: CharacterConfig;
}

/** 가챠 아이템 풀. */
// TODO: 서버 연동 시 아이템 풀/확률은 API 응답으로 대체
const GOTCHA_ITEM_POOL: GotchaItem[] = [
  { id: 'clothing01', name: '베이직 티셔츠', part: 'clothing' },
  { id: 'clothing02', name: '스트라이프 셔츠', part: 'clothing' },
  { id: 'clothing03', name: '체크 남방', part: 'clothing' },
  { id: 'clothing04', name: '후드 집업', part: 'clothing' },
  { id: 'red-glasses', name: '빨간 안경', part: 'accessory' },
];

/**
 * 풀에서 무작위 1개를 뽑아, 기본 캐릭터에 착용시킨 미리보기와 함께 반환한다.
 * (toMarketItem의 그리드 썸네일과 동일하게 기본 캐릭터 기준, 누적 X)
 */
function pullOne(): GotchaPull {
  const item = GOTCHA_ITEM_POOL[Math.floor(Math.random() * GOTCHA_ITEM_POOL.length)];
  return {
    item,
    // TODO: 유저의 실제 캐릭터 config를 받아오면 그걸 기반으로 교체
    preview: { ...DEFAULT_CHARACTER_CONFIG, [item.part]: item.id },
  };
}

/** count회 뽑기 결과 목록을 반환한다. (1회 / 5회) */
export function pullGotcha(count: 1 | 5): GotchaPull[] {
  return Array.from({ length: count }, pullOne);
}
