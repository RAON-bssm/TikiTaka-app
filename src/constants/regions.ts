/**
 * 동네(지역) 선택용 목록 정의.
 *
 * 회원가입·동네 수정 등 여러 화면에서 동일한 시/구 목록을 사용하므로,
 * 목록이 바뀌면 이 파일만 수정하면 되도록 한 곳에 모아둔다.
 */

/** 시/도 목록 */
export const CITIES = ['부산시', '서울시', '대구시', '인천시', '광주시', '대전시', '울산시'];

/** 구/군 목록 */
export const DISTRICTS = ['영도구', '사상구', '기장군', '연제구', '강서구', '수영구', '해운대구'];

/**
 * 구/군 이름 → 서버 location_id (**임시**).
 *
 * 회원가입은 `main_location_id`(서버 location 테이블의 PK)를 요구하는데, 지금은 동네 목록을
 * 내려주는 API가 없어 실제 id를 알 수 없다. 그래서 목록 순서를 1-base id로 가정해 임시로 쓴다.
 * 실제 DB id와 다르면 회원가입이 400("존재하지 않는 동네입니다.")으로 실패한다.
 *
 * TODO(백엔드 동네 목록 API 연동): 엔드포인트가 나오면 이 함수를 지우고,
 * 서버가 내려주는 { location_id, location_name }을 그대로 선택지로 쓴다.
 */
export function getTempLocationId(district: string): number | null {
  const index = DISTRICTS.indexOf(district);
  return index === -1 ? null : index + 1;
}
