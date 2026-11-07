// 땅따먹기 동 열거형과 구 경계를 생성한다. 실행: pnpm generate:territory-dongs
// - 원본: scripts/data/territory/
//   - busan_dong_list.csv: 서버 seed/busan_dong_list.csv 그대로(adm_cd2, gu, dong). 서버와 같은 버전이어야 한다.
//   - busan_dong.geojson: 같은 버전의 행정동 경계(properties.adm_cd2)
// - 출력:
//   - src/constants/territory/dongs.ts: 동 코드 → 구·동 이름
//   - src/constants/territory/guBoundaries.json: 구별 경계(본진 구 안에서 찍었는지 판정용, 단순화)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(__dirname, 'data/territory');
const OUT_DIR = path.join(ROOT, 'src/constants/territory');

const SOURCE_VERSION = 'ver20261001';
const EXPECTED_DONGS = 206;
// 약 10m. GPS 오차보다 작아 판정 정확도에 영향이 없고, 점 수를 크게 줄인다.
const SIMPLIFY_TOLERANCE = 0.0001;
const COORD_DIGITS = 5;

function readCsv() {
  const text = fs
    .readFileSync(path.join(DATA_DIR, 'busan_dong_list.csv'), 'utf8')
    .replace(/^﻿/, '');
  const [header, ...lines] = text.trim().split(/\r?\n/);
  const columns = header.split(',');
  const index = (name) => {
    const i = columns.indexOf(name);
    if (i < 0) throw new Error(`csv에 ${name} 컬럼이 없습니다: ${columns}`);
    return i;
  };
  const [codeAt, guAt, dongAt] = [index('adm_cd2'), index('gu'), index('dong')];
  return lines.map((line) => {
    const cells = line.split(',');
    return { code: Number(cells[codeAt]), gu: cells[guAt].trim(), name: cells[dongAt].trim() };
  });
}

function perpendicularDistance([x, y], [x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / Math.hypot(dx, dy);
}

function simplify(points) {
  if (points.length <= 3) return points;
  let maxDistance = 0;
  let maxIndex = 0;
  const last = points.length - 1;
  for (let i = 1; i < last; i += 1) {
    const distance = perpendicularDistance(points[i], points[0], points[last]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }
  if (maxDistance <= SIMPLIFY_TOLERANCE) return [points[0], points[last]];
  return [
    ...simplify(points.slice(0, maxIndex + 1)).slice(0, -1),
    ...simplify(points.slice(maxIndex)),
  ];
}

const round = (value) => Number(value.toFixed(COORD_DIGITS));

/** 링을 [lng, lat, lng, lat, ...]로 펼친다. 너무 작아져 면이 사라진 링은 버린다. */
function flattenRing(ring) {
  const simplified = simplify(ring);
  if (simplified.length < 4) return null;
  return simplified.flatMap(([lng, lat]) => [round(lng), round(lat)]);
}

function toPolygons(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons
    .map((rings) => rings.map(flattenRing).filter(Boolean))
    .filter((rings) => rings.length > 0);
}

function main() {
  const dongs = readCsv();
  const codes = new Set(dongs.map((dong) => dong.code));
  if (codes.size !== dongs.length) throw new Error('adm_cd2가 중복됩니다');
  if (dongs.length !== EXPECTED_DONGS) {
    console.warn(`경고: 동 수가 ${dongs.length}개입니다(예상 ${EXPECTED_DONGS})`);
  }

  const geojson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'busan_dong.geojson'), 'utf8'));
  const guByCode = new Map(dongs.map((dong) => [dong.code, dong.gu]));
  const boundaries = {};
  const seen = new Set();
  for (const feature of geojson.features) {
    const code = Number(feature.properties.adm_cd2);
    const gu = guByCode.get(code);
    if (!gu) throw new Error(`csv에 없는 동이 경계에 있습니다: ${code}`);
    seen.add(code);
    (boundaries[gu] ??= []).push(...toPolygons(feature.geometry));
  }
  const missing = dongs.filter((dong) => !seen.has(dong.code));
  if (missing.length > 0) {
    throw new Error(`경계가 없는 동: ${missing.map((dong) => dong.code).join(', ')}`);
  }

  const sorted = [...dongs].sort((a, b) => a.code - b.code);
  const rows = sorted
    .map((dong) => `  { code: ${dong.code}, gu: '${dong.gu}', name: '${dong.name}' },`)
    .join('\n');
  const ts = `// 자동 생성: scripts/generate-territory-dongs.mjs (${SOURCE_VERSION}). 직접 고치지 말 것

/** 서버 시드와 같은 경계 데이터 버전. 다르면 희망 동 등록이 400이거나 지도에서 동이 빠진다. */
export const DONG_SOURCE_VERSION = '${SOURCE_VERSION}';

export interface Dong {
  /** 행정동 코드(adm_cd2). 서버의 \`dong_code\`와 같은 값이다. */
  code: number;
  /** 구·군 이름. 서버 동네(\`location_name\`)와 같은 표기다. */
  gu: string;
  name: string;
}

export const DONGS: readonly Dong[] = [
${rows}
];
`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'dongs.ts'), ts);
  fs.writeFileSync(path.join(OUT_DIR, 'guBoundaries.json'), JSON.stringify(boundaries));

  const points = Object.values(boundaries)
    .flat(2)
    .reduce((sum, ring) => sum + ring.length / 2, 0);
  console.log(`동 ${sorted.length}개, 구 ${Object.keys(boundaries).length}개, 경계 점 ${points}개`);
}

main();
