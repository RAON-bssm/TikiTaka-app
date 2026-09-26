/**
 * 시/도 + 동네 표시명(예: `'부산광역시 북구'`). 서버가 매치 팀 이름을 이 형태로 주므로
 * 다른 응답도 맞춰야 짝이 맞는다. 동명의 구(북구 등)가 있어 동네명만으로는 구분되지 않는다.
 */
export function formatLocationName(cityName?: string, locationName?: string): string {
  return [cityName, locationName].filter(Boolean).join(' ');
}
