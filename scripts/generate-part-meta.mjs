// 캐릭터 파츠 WebP를 분석하여 src/constants/character/partMeta.ts를 생성한다.
// 실행: pnpm generate:part-meta
//
// 각 파츠에 대해 뽑는 것:
//    - bbox: 투명 여백을 제외한 실제 콘텐츠 영역 (0~1  정규화 좌표) -> 미리보기 확대에 사용
//    - isDark: 이미지가 어두운지 여부 -> 미리보기 배경색 결정에 사용

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..'); //프로젝트 루트 주소

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
      // windows에서도 키가 'mouth/smile' 형태가 되도록 구분자를 /로 통일
      .map((p) => p.split(path.sep).join('/'))
  );
}

// 소수점 4자리로 반올림 (재생성 시 diff 노이즈 방지)
function round(value) {
  return Number(value.toFixed(4));
}

/**
 * 파츠 이미지 하나를 분석해서 { bbox, isDark }를 반환.
 * 불투명 픽셀이 하나도 없으면 null.
 */
async function analyzePart(relPath) {
  // raw(): 디코딩된 픽셀 버퍼를 그대로 받는다.
  // ensureAlpha(): 알파 채널이 없는 이미지도 RGBA 4채널로 통일시켜서 아래 루프의 인덱스 계산(픽셀당 4바이트)이 항상 성립하게 한다
  const { data, info } = await sharp(path.join(ASSETS_DIR, relPath))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // bbox 추적용: 불투명 픽셀을 만날 때마다 좁혀나간다
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  // 색 평균용: 알파 가중 합. 반투명 픽셀은 보이는 만큼만 색에 기여해야 안티앨리어싱 가장자리가 평균을 왜곡하지 않는다
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let aSum = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // data는 [R,G,B,A, R,G,B,A, ...] 순서의 1차원 버퍼
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

  // 불투명 픽셀이 하나도 없다 => 빈 이미지
  if (maxX < 0) return null;

  // WCAG 상대 휘도 근사식. 사람 눈은 초록에 민감하기에 G의 계수가 크다
  // 0(완점 검정) ~ 1(완전 흰색) 범위가 되도록 255로 나눈다.
  const luminance =
    (0.2126 * (rSum / aSum) + 0.7152 * (gSum / aSum) + 0.0722 * (bSum / aSum)) / 255;

  return {
    //픽셀 좌표를 0~1 비율로 정규화. 모든 파츠가 같은 1:1 캔버스 기준이라 에셋 해상도가 바뀌어도 이 값은 유효
    bbox: {
      x: round(minX / width),
      y: round(minY / height),
      width: round((maxX - minX + 1) / width),
      height: round((maxY - minY + 1) / height),
    },
    isDark: luminance < LUMINANCE_THRESHOLD,
  };
}

/**
 * assets.ts에 require로 등록된 파츠 id 목록을 추출.
 * assets.ts는 RN용 require가 섞여 있어 Node에서 import할 수 없으므로 텍스트로 읽어 정규식으로 경로만 뽑는다
 */
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

  // 레지스트리에는 등록되었지만 메타가 없는 파츠 = 화면에서 확대/배경이 풀백으로 뜨는 파츠
  // 조용히 넘어가지 않고 실패시켜서 바로 알아채게 한다
  const missing = getRegistryIds().filter((id) => !(id in meta));
  if (missing.length > 0) {
    console.error(`assets.ts에 등록됐지만 분석 결과가 없는 파츠:`);
    missing.forEach((id) => console.error(` -${id}`));
    process.exit(1);
  }

  // 키를 정렬해서 파츠 추가 시 git diff가 해당 줄만 바뀌게 한다
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
