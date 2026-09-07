import type { ApiResponse } from './api';
import type { ProductType } from './product';

/**
 * 보유 아이템 한 건. `GET /api/inventory`
 *
 * `type`은 상점의 `product_type`과 같은 값이지만 **키 이름이 다르다.**
 */
export interface InventoryItem {
  product_id: number;
  product_name: string;
  type: ProductType;
  /** 착용 중인지. 서버 필드명이 `isActive`라 실제 키가 `active`로 올 수도 있다 — 첫 연동 때 확인할 것. */
  is_active: boolean;
}

/** `GET /api/inventory` 응답 data. (배열 키가 `inventory`가 아니라 `product`다) */
export interface InventoryListData {
  product: InventoryItem[];
}

export type InventoryListResponse = ApiResponse<InventoryListData>;
