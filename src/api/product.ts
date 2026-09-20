import type { ApiResponse, EmptyResponse } from '@/types/api';
import type { Product, ProductListData, PurchaseProductRequest } from '@/types/product';
import client from './client';

/**
 * 상점 상품 목록. `GET /api/product`
 * 이미 보유한 상품은 서버가 걸러서 내려준다.
 */
export async function getProducts(): Promise<Product[]> {
  const { data } = await client.get<ApiResponse<ProductListData>>('/api/product');
  return data.data.product;
}

/**
 * 상품 구매. `PATCH /api/product/store`
 * 서버가 구매 결과 데이터를 내려주지 않으므로(data: null), 반영은 목록/인벤토리 재조회로 한다.
 * 실패: 403(포인트 부족), 409(이미 보유), 404(없거나 비활성)
 */
export async function purchaseProduct(req: PurchaseProductRequest): Promise<void> {
  await client.patch<EmptyResponse>('/api/product/store', req);
}
