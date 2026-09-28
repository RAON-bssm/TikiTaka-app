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

/** 뽑기권도 상품 목록에 섞여 온다. 파츠가 아니라 `PRODUCT_TYPES`에는 넣지 않는다. */
export type ShopProductType = ProductType | 'gashapon';

/** 이미 보유한 상품은 서버가 걸러서 내려준다. */
export interface Product {
  /**
   * 숫자가 아니라 클라이언트 파츠 에셋 id(예: `"hair-back-bob"`)다 — 서버와 같게 내려주기로 합의했다.
   * `assets.ts` 레지스트리에 없으면 에러 없이 썸네일만 비므로, 계약이 바뀌면 `toMarketItem`의 `assetId`를 먼저 고칠 것.
   */
  product_id: string;
  /** 화면 표시용 한글 이름(`"빨간 안경"`). 에셋 매핑에 쓰지 말 것. */
  product_name: string;
  price: number;
  /** S3 key인지 완성된 URL인지 서버가 강제하지 않는다 — 시드 데이터로 확인 필요. */
  product_image: string;
  product_type: ShopProductType;
  product_description?: string;
}

/** 뽑기권을 걸러 낸 파츠 상품. `isPartProduct`(`src/constants/market.ts`)로 좁힌다. */
export type PartProduct = Product & { product_type: ProductType };

/** 배열 키가 `products`가 아니라 `product`다. */
export interface ProductListData {
  product: Product[];
}

export type ProductListResponse = ApiResponse<ProductListData>;

export interface PurchaseProductRequest {
  product_id: string;
}

/** 뽑기권 상품 id. 서버가 이 id별 뽑는 횟수를 하드코딩해 두고, 가격은 상품 목록의 값을 쓴다. */
export interface DrawGashaponRequest {
  product_id: string;
}

/** 뽑기 풀은 뽑기권을 뺀 모든 활성 상품이라 코스튬·악세서리 외 파츠도 나온다. */
export interface GashaponDrawItem {
  product_id: string;
  product_name: string;
  product_image: string;
  product_type: ProductType;
  description: string;
  /** 이미 보유한 상품이면 true. 인벤토리에 추가되지 않고 포인트 환급도 없다. */
  duplicate: boolean;
  message: string;
}

/** 5회 뽑기면 5개. 같은 요청 안에서 겹친 두 번째부터는 `duplicate`다. */
export interface GashaponDrawData {
  results: GashaponDrawItem[];
}
