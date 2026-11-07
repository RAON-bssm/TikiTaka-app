import { DONGS, type Dong } from './dongs';
import guBoundaries from './guBoundaries.json';

/** 링은 [lng, lat, lng, lat, ...]. 폴리곤의 첫 링이 외곽선, 나머지는 구멍이다. */
type FlatRing = number[];
type Polygon = FlatRing[];

const BOUNDARIES = guBoundaries as Record<string, Polygon[]>;

export function getDongsInGu(gu: string): Dong[] {
  return DONGS.filter((dong) => dong.gu === gu);
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
export function isInGu(gu: string, position: { latitude: number; longitude: number }): boolean {
  const polygons = BOUNDARIES[gu];
  if (!polygons) return false;
  return polygons.some((polygon) => isInPolygon(position.longitude, position.latitude, polygon));
}
