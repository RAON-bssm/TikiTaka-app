import type { ApiResponse } from './api';

/**
 * 아이템이 착용되는 캐릭터 파츠 슬롯. 서버 `ProductType` enum의 소문자다.
 *
 * 앱 `CharacterConfig` 키와 거의 같지만 **앞/뒷머리가 스네이크 케이스**이고
 * (`hair_front` ↔ `hairFront`), 서버에는 `hairHighlights`와 **색상 개념이 없다.**
 * 이 키 변환은 `PRODUCT_TYPE_TO_PART_KEY`(`src/constants/market.ts`)가 담당한다.
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

/**
 * 상점 상품 한 건. `GET /api/product`
 *
 * **이미 보유한 상품은 서버가 걸러서** 내려준다. (보유 목록은 `GET /api/inventory`)
 */
export interface Product {
  product_id: number;
  /**
   * 표시 이름이자 **클라이언트 파츠 에셋 id**(예: `"bob"`). 서버가 두 값을 같게 내려주기로
   * 합의해서 별도 매핑 테이블을 두지 않는다. 값이 `assets.ts` 레지스트리에 없으면
   * 에러 없이 썸네일만 비므로, 계약이 바뀌면 `toMarketItem`의 `assetId`를 먼저 고칠 것.
   */
  product_name: string;
  price: number;
  /** S3 key인지 완성된 URL인지 서버가 강제하지 않는다 — 시드 데이터로 확인 필요. */
  product_image: string;
  product_type: ProductType;
}

/** `GET /api/product` 응답 data. (배열 키가 `products`가 아니라 `product`다) */
export interface ProductListData {
  product: Product[];
}

export type ProductListResponse = ApiResponse<ProductListData>;

/**
 * 상품 구매 요청 body. `PATCH /api/product/store`
 *
 * 실패: 403(포인트 부족), 409(이미 보유), 404(없거나 비활성)
 */
export interface PurchaseProductRequest {
  product_id: number;
}
