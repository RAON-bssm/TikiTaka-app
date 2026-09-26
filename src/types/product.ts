import type { ApiResponse } from './api';

/**
 * 서버 `ProductType` enum의 소문자. `CharacterConfig` 키와 달리 앞/뒷머리가 스네이크 케이스이고
 * `hairHighlights`·색상 개념이 없다. 키 변환은 `PRODUCT_TYPE_TO_PART_KEY`(`src/constants/market.ts`).
 */
export const PRODUCT_TYPES = [
  'body',
  'accessory',
  'clothing',
  'eyes',
  'hair_front',
  'hair_back',
  'mouth',
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

/** 이미 보유한 상품은 서버가 걸러서 내려준다. */
export interface Product {
  product_id: number;
  /**
   * 표시 이름이자 클라이언트 파츠 에셋 id(예: `"bob"`) — 서버와 같게 내려주기로 합의했다.
   * `assets.ts` 레지스트리에 없으면 에러 없이 썸네일만 비므로, 계약이 바뀌면 `toMarketItem`의 `assetId`를 먼저 고칠 것.
   */
  product_name: string;
  price: number;
  /** S3 key인지 완성된 URL인지 서버가 강제하지 않는다 — 시드 데이터로 확인 필요. */
  product_image: string;
  product_type: ProductType;
}

/** 배열 키가 `products`가 아니라 `product`다. */
export interface ProductListData {
  product: Product[];
}

export type ProductListResponse = ApiResponse<ProductListData>;

export interface PurchaseProductRequest {
  product_id: number;
}
