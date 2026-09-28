import type { ApiResponse, EmptyResponse } from '@/types/api';
import type {
  DrawGashaponRequest,
  GashaponDrawData,
  GashaponDrawItem,
  Product,
  ProductListData,
  PurchaseProductRequest,
} from '@/types/product';
import client from './client';

/** 이미 보유한 상품은 서버가 걸러서 내려준다. */
export async function getProducts(): Promise<Product[]> {
  const { data } = await client.get<ApiResponse<ProductListData>>('/api/product');
  return data.data.product;
}

/** 결과 데이터가 없으므로 반영은 목록/인벤토리 재조회로 한다. 실패: 403 포인트 부족, 409 이미 보유, 404 없거나 비활성. */
export async function purchaseProduct(req: PurchaseProductRequest): Promise<void> {
  await client.patch<EmptyResponse>('/api/product/store', req);
}

/** 실패: 403 포인트 부족, 404 없는 뽑기권이거나 뽑을 상품이 없음. */
export async function drawGashapon(req: DrawGashaponRequest): Promise<GashaponDrawItem[]> {
  const { data } = await client.patch<ApiResponse<GashaponDrawData>>('/api/product/gashapon', req);
  return data.data.results;
}
