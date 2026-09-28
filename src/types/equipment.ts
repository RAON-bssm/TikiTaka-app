import type { ApiResponse } from './api';

export interface EquipmentItem {
  product_id: number;
  product_name: string;
  product_image: string;
}

/**
 * `GET /api/equipment`(내 장비)와 `GET /api/equipment/{user_id}`(남의 장비)가 같은 형태다.
 * 착용하지 않은 슬롯은 키가 빠진다. 서버엔 색상 개념이 없어 `CharacterConfig`로 바꾸려면
 * product_id → 파츠 id 매핑이 클라이언트에 있어야 한다.
 */
export interface Equipment {
  body?: EquipmentItem;
  accessory?: EquipmentItem;
  clothing?: EquipmentItem;
  eyes?: EquipmentItem;
  hair_front?: EquipmentItem;
  hair_back?: EquipmentItem;
  mouth?: EquipmentItem;
}

export type EquipmentResponse = ApiResponse<Equipment>;

/**
 * 넘긴 슬롯만 교체되고 생략한 슬롯은 유지된다 — 이 API로는 벗을 수 없다.
 * 미보유 product_id는 404가 아니라 500(서버 예외 미매핑), 슬롯·상품 타입 불일치 400.
 * 성공 시 바디 `status`는 204지만 HTTP 상태는 200이다.
 */
export interface EquipRequest {
  body?: number;
  accessory?: number;
  clothing?: number;
  eyes?: number;
  hair_front?: number;
  hair_back?: number;
  mouth?: number;
}
