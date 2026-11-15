import type { Location } from '@/types/location';
import { DONGS, type Dong } from './dongs';
import guBoundaries from './guBoundaries.json';

/** 땅따먹기는 부산만 한다. 동·경계 데이터에는 구 이름만 있어, 다른 시의 같은 이름 구(북구 등)를 여기서 걸러낸다. */
export const TERRITORY_CITY = '부산광역시';

/**
 * 땅따먹기 사진을 본진 구 안에서 찍었는지 GPS로 확인할지. 사용자가 적은 동안은 구 밖에서도 찍게 꺼 둔다.
 * 끄면 위치 권한을 묻지 않고 좌표도 보내지 않는다. 서버는 위치를 검증하지 않아 다시 켤 때 이 값만 바꾸면 된다.
 */
export const HOME_GU_LOCATION_CHECK_ENABLED = false;

function isTerritoryCity(team: Location): boolean {
  return team.city_name === TERRITORY_CITY;
}

/** 링은 [lng, lat, lng, lat, ...]. 폴리곤의 첫 링이 외곽선, 나머지는 구멍이다. */
type FlatRing = number[];
type Polygon = FlatRing[];

const BOUNDARIES = guBoundaries as Record<string, Polygon[]>;

const NO_DONGS: Dong[] = [];
const dongsByGu = new Map<string, Dong[]>();

/** 같은 구면 같은 배열을 돌려준다. 렌더마다 새 배열이면 이 값으로 그리는 지도(`PreferenceMap`)가 매번 경계를 다시 계산한다. */
export function getDongsInTeam(team: Location): Dong[] {
  if (!isTerritoryCity(team)) return NO_DONGS;
  let dongs = dongsByGu.get(team.location_name);
  if (!dongs) {
    dongs = DONGS.filter((dong) => dong.gu === team.location_name);
    dongsByGu.set(team.location_name, dongs);
  }
  return dongs;
}

export function findDong(code: number): Dong | undefined {
  return DONGS.find((dong) => dong.code === code);
}

/** 짝홀 규칙이라 구멍 링도 같은 방식으로 세면 구멍 안은 바깥으로 판정된다. */
function isInPolygon(lng: number, lat: number, polygon: Polygon): boolean {
  let inside = false;
  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
      const xi = ring[i];
      const yi = ring[i + 1];
      const xj = ring[j];
      const yj = ring[j + 1];
      if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

/** 서버는 촬영 위치를 검증하지 않아 앱이 막는다. 동 경계를 합친 것이 구 경계다. */
export function isInTeamArea(
  team: Location,
  position: { latitude: number; longitude: number },
): boolean {
  if (!isTerritoryCity(team)) return false;
  const polygons = BOUNDARIES[team.location_name];
  if (!polygons) return false;
  return polygons.some((polygon) => isInPolygon(position.longitude, position.latitude, polygon));
}
