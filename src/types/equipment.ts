import type { ApiResponse } from './api';

export interface EquipmentItem {
  /** 파츠 에셋 id. (`Product.product_id` 참고) */
  product_id: string;
  product_name: string;
  product_image: string;
}

/**
 * `GET /api/equipment`(내 장비)와 `GET /api/equipment/{user_id}`(남의 장비)가 같은 형태다.
 * 착용하지 않은 슬롯은 키가 빠진다. 서버엔 색상 개념이 없어 `CharacterConfig`로 바꾸면
 * 모양만 product_id(= 파츠 에셋 id)로 복원된다.
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
 * 실패: 404 미보유 product_id, 400 슬롯·상품 타입 불일치. 성공은 HTTP 204(바디 없음)다.
 */
export interface EquipRequest {
  body?: string;
  accessory?: string;
  clothing?: string;
  eyes?: string;
  hair_front?: string;
  hair_back?: string;
  mouth?: string;
}
