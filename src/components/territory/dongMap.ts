import dongShapes from '@/constants/territory/dongShapes.json';

/** 링은 [lng, lat, lng, lat, ...]. 폴리곤의 첫 링이 외곽선, 나머지는 구멍이다. */
type Polygon = number[][];
const SHAPES = dongShapes as Record<string, Polygon[]>;

export function hasShape(code: number): boolean {
  return !!SHAPES[code];
}

interface ProjectionOptions {
  padding: number;
  minHeight: number;
  maxHeight: number;
}

/** 폭을 아직 모르거나 그릴 동이 없으면 scale이 0이다. */
export function projectDongs(
  codes: number[],
  width: number,
  { padding, minHeight, maxHeight }: ProjectionOptions,
) {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const code of codes) {
    for (const [outer] of SHAPES[code] ?? []) {
      for (let i = 0; i < outer.length; i += 2) {
        minLng = Math.min(minLng, outer[i]);
        maxLng = Math.max(maxLng, outer[i]);
        minLat = Math.min(minLat, outer[i + 1]);
        maxLat = Math.max(maxLat, outer[i + 1]);
      }
    }
  }

  // 경도 1도는 위도 1도보다 짧아(부산 기준 약 0.82배) 그대로 그리면 옆으로 늘어난다.
  const lngScale = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanX = (maxLng - minLng) * lngScale;
  const spanY = maxLat - minLat;
  const innerWidth = width - padding * 2;
  const height =
    spanX > 0
      ? Math.min(maxHeight, Math.max(minHeight, (innerWidth * spanY) / spanX + padding * 2))
      : minHeight;
  const scale =
    spanX > 0 && innerWidth > 0 ? Math.min(innerWidth / spanX, (height - padding * 2) / spanY) : 0;
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;
  const toX = (lng: number) => offsetX + (lng - minLng) * lngScale * scale;
  const toY = (lat: number) => offsetY + (maxLat - lat) * scale;

  const toPath = (code: number) =>
    (SHAPES[code] ?? [])
      .flatMap((rings) =>
        rings.map((ring) => {
          let d = '';
          for (let i = 0; i < ring.length; i += 2) {
            d += `${i === 0 ? 'M' : 'L'}${toX(ring[i]).toFixed(1)} ${toY(ring[i + 1]).toFixed(1)}`;
          }
          return `${d}Z`;
        }),
      )
      .join('');

  /** 가장 큰 조각의 무게중심. 섬이 딸린 동도 본토 위에 이름이 놓인다. */
  const labelPoint = (code: number): { x: number; y: number } | undefined => {
    const polygons = SHAPES[code];
    if (!polygons) return undefined;
    let best: [number, number] = [polygons[0][0][0], polygons[0][0][1]];
    let bestArea = 0;
    for (const [outer] of polygons) {
      let area = 0;
      let cx = 0;
      let cy = 0;
      for (let i = 0, j = outer.length - 2; i < outer.length; j = i, i += 2) {
        const cross = outer[j] * outer[i + 1] - outer[i] * outer[j + 1];
        area += cross;
        cx += (outer[j] + outer[i]) * cross;
        cy += (outer[j + 1] + outer[i + 1]) * cross;
      }
      if (Math.abs(area) > bestArea && area !== 0) {
        bestArea = Math.abs(area);
        best = [cx / (3 * area), cy / (3 * area)];
      }
    }
    return { x: toX(best[0]), y: toY(best[1]) };
  };

  return { height, scale, toPath, labelPoint };
}

export const LABEL_SIZE = 11;
export const LABEL_HEIGHT = 20;
const LABEL_PAD_X = 8;
// 한글 한 글자 폭은 글자 크기와 거의 같다. 텍스트를 재지 않고 겹침만 피하려는 근사값이다.
const labelWidth = (text: string) => text.length * LABEL_SIZE + LABEL_PAD_X * 2;
const LABEL_OFFSETS = [0, -1, 1, -2, 2, -3, 3].map((step) => step * (LABEL_HEIGHT + 4));

/** 라벨이 몇 개뿐이라 단순 탐색으로 충분하다. 겹치면 위아래로 옮기고, `labelY`가 원래 `y`와 다르면 지시선을 긋는다. */
export function placeLabels<T extends { text: string; x: number; y: number }>(
  inputs: T[],
  width: number,
  height: number,
) {
  const placed: { left: number; right: number; top: number; bottom: number }[] = [];
  return inputs.map((input) => {
    const w = labelWidth(input.text);
    const x = Math.min(Math.max(input.x, w / 2 + 2), width - w / 2 - 2);
    let labelY = input.y;
    for (const offset of LABEL_OFFSETS) {
      const candidate = Math.min(
        Math.max(input.y + offset, LABEL_HEIGHT / 2 + 2),
        height - LABEL_HEIGHT / 2 - 2,
      );
      const box = {
        left: x - w / 2,
        right: x + w / 2,
        top: candidate - LABEL_HEIGHT / 2,
        bottom: candidate + LABEL_HEIGHT / 2,
      };
      const overlaps = placed.some(
        (other) =>
          box.left < other.right &&
          box.right > other.left &&
          box.top < other.bottom &&
          box.bottom > other.top,
      );
      if (!overlaps) {
        labelY = candidate;
        placed.push(box);
        break;
      }
    }
    return { ...input, x, labelY, w };
  });
}
