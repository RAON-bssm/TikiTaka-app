import type { ApiResponse } from './api';

/** 착용 중인 아이템 한 건. */
export interface EquipmentItem {
  product_id: number;
  product_name: string;
}

/**
 * 현재 착용 상태. `GET /api/equipment`
 *
 * **아무것도 착용하지 않은 슬롯은 키 자체가 내려오지 않는다.**
 * 서버는 색상(`hairColor`/`eyesColor`)을 모르므로, 이 응답을 `CharacterConfig`로 바꾸려면
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
 * 착용 변경 요청 body. `PATCH /api/equipment`
 *
 * **넘긴 슬롯만 교체된다.** 생략한 슬롯은 유지되므로 이 API로는 **아이템을 벗을 수 없다.**
 * 미보유 product_id면 404, 슬롯과 상품 타입이 어긋나면 400.
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
