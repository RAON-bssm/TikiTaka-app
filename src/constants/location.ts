/**
 * 시/도와 동네를 합친 표시용 지역명. 예: `'부산광역시 북구'`
 *
 * 서버가 매치 팀 이름을 `Location.getFullName()`(= 시/도 + 동네)으로 내려주므로,
 * 시/도가 나뉘어 오는 응답(랭킹·프로필)도 이 형태로 맞춰야 짝이 맞고 표기도 일관된다.
 * 같은 이름의 구가 시/도마다 있어(북구 등) 동네명만으로는 구분되지 않는다.
 */
export function formatLocationName(cityName?: string, locationName?: string): string {
  return [cityName, locationName].filter(Boolean).join(' ');
}
