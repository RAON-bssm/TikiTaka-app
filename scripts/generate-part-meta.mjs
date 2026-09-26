// 캐릭터 파츠 WebP를 분석해 partMeta.ts를 생성한다. 실행: pnpm generate:part-meta
// - bbox: 투명 여백을 뺀 콘텐츠 영역(0~1 정규화) -> 썸네일 확대
// - isDark: 어두운 이미지 여부 -> 썸네일 배경색

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ASSETS_DIR = path.join(ROOT, 'assets/character');
const REGISTRY_PATH = path.join(ROOT, 'src/constants/character/assets.ts');
const OUTPUT_PATH = path.join(ROOT, 'src/constants/character/partMeta.ts');

const ALPHA_THRESHOLD = 8;
const LUMINANCE_THRESHOLD = 0.45;

function collectWebpFiles() {
  return (
    fs
      .readdirSync(ASSETS_DIR, { recursive: true })
      .filter((p) => p.endsWith('.webp'))
      // Windows에서도 키 구분자를 /로 통일
      .map((p) => p.split(path.sep).join('/'))
  );
}

// 소수점 4자리로 반올림 (재생성 시 diff 노이즈 방지)
function round(value) {
  return Number(value.toFixed(4));
}

/** { bbox, isDark }를 반환. 불투명 픽셀이 없으면 null. */
async function analyzePart(relPath) {
  // ensureAlpha(): 알파 없는 이미지도 RGBA로 맞춰 아래 픽셀당 4바이트 인덱스 계산이 성립하게 한다
  const { data, info } = await sharp(path.join(ASSETS_DIR, relPath))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  // 알파 가중 합: 안티앨리어싱된 반투명 가장자리가 색 평균을 왜곡하지 않게 한다
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let aSum = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a <= ALPHA_THRESHOLD) continue;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      rSum += data[i] * a;
      gSum += data[i + 1] * a;
      bSum += data[i + 2] * a;
      aSum += a;
    }
  }

  if (maxX < 0) return null;

  // WCAG 상대 휘도 근사(0~1)
  const luminance =
    (0.2126 * (rSum / aSum) + 0.7152 * (gSum / aSum) + 0.0722 * (bSum / aSum)) / 255;

  return {
    // 모든 파츠가 같은 1:1 캔버스라 정규화하면 에셋 해상도가 바뀌어도 유효하다
    bbox: {
      x: round(minX / width),
      y: round(minY / height),
      width: round((maxX - minX + 1) / width),
      height: round((maxY - minY + 1) / height),
    },
    isDark: luminance < LUMINANCE_THRESHOLD,
  };
}

// assets.ts는 RN용 require가 섞여 Node에서 import할 수 없어, 텍스트로 읽어 경로만 뽑는다.
function getRegistryIds() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.warn(`레지스트리 파일 없음, 대조 생략: ${REGISTRY_PATH}`);
    return [];
  }
  const source = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  const re = /require\(\s*['"]@\/assets\/character\/(.+?)\.webp['"]\s*\)/g;
  return [...source.matchAll(re)].map((m) => m[1]);
}

async function main() {
  const files = collectWebpFiles();
  if (files.length === 0) {
    console.error(`${ASSETS_DIR}에서 .webp를 찾지 못했습니다.`);
    process.exit(1);
  }

  const meta = {};
  const skipped = [];

  for (const relPath of files) {
    const id = relPath.replace(/\.webp$/, '');
    const result = await analyzePart(relPath);
    if (result === null) {
      console.warn(`빈 이미지(전부 투명), 메타에서 제외 ${id}`);
      skipped.push(id);
      continue;
    }
    meta[id] = result;
  }

  // 레지스트리에 있는데 메타가 없으면 썸네일이 폴백으로 뜨므로 조용히 넘기지 않고 실패시킨다
  const missing = getRegistryIds().filter((id) => !(id in meta));
  if (missing.length > 0) {
    console.error(`assets.ts에 등록됐지만 분석 결과가 없는 파츠:`);
    missing.forEach((id) => console.error(` -${id}`));
    process.exit(1);
  }

  // 정렬해서 파츠 추가 시 diff가 해당 줄만 바뀌게 한다
  const entries = Object.keys(meta)
    .sort()
    .map((key) => {
      const { bbox, isDark } = meta[key];
      return `    '${key}': { bbox: { x: ${bbox.x}, y: ${bbox.y}, width: ${bbox.width}, height: ${bbox.height}}, isDark: ${isDark}},`;
    })
    .join('\n');

  const output = `// 이 파일은 scripts/generate-part-meta.mjs가 생성합니다. 직접 수정하지 마세요.
// 재생성: pnpm generate:part-meta

export const PART_META = {
${entries}
} as const;

export type PartMetaKey = keyof typeof PART_META;
`;
  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(
    `${Object.keys(meta).length}개 분석 완료` +
      (skipped.length > 0 ? `, ${skipped.length}개 제외` : '') +
      ` → ${path.relative(ROOT, OUTPUT_PATH)}`,
  );
}

main().catch((err) => {
  console.error('오류:', err);
  process.exit(1);
});
