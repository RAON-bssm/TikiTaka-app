import type { ApiResponse } from './api';
import type { ProductType } from './product';

export interface InventoryItem {
  product_id: number;
  product_name: string;
  /** 상점의 `product_type`과 같은 값이지만 키 이름이 다르다. */
  type: ProductType;
  /** 착용 중인지. */
  is_active: boolean;
}

/** 배열 키가 `inventory`가 아니라 `product`다. */
export interface InventoryListData {
  product: InventoryItem[];
}

export type InventoryListResponse = ApiResponse<InventoryListData>;
