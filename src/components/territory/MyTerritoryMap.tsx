import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import dongShapes from '@/constants/territory/dongShapes.json';
import { DONGS } from '@/constants/territory/dongs';
import { findDong } from '@/constants/territory/region';
import type { MyTerritory } from '@/types/territory';

/** 링은 [lng, lat, lng, lat, ...]. 폴리곤의 첫 링이 외곽선, 나머지는 구멍이다. */
type Polygon = number[][];
const SHAPES = dongShapes as Record<string, Polygon[]>;

const PADDING = 12;
const MIN_HEIGHT = 200;
const MAX_HEIGHT = 320;
const LABEL_SIZE = 11;
const LABEL_HEIGHT = 20;
const LABEL_PAD_X = 8;
// 한글 한 글자 폭은 글자 크기와 거의 같다. 텍스트를 재지 않고 겹침만 피하려는 근사값이다.
const labelWidth = (name: string) => name.length * LABEL_SIZE + LABEL_PAD_X * 2;
const LABEL_OFFSETS = [0, -1, 1, -2, 2, -3, 3].map((step) => step * (LABEL_HEIGHT + 4));

type LandStatus = 'owned' | 'unset' | 'pending';

const STATUS_STYLE: Record<LandStatus, { fill: string; dot: string; legend: string }> = {
  owned: { fill: palette.primary[600], dot: 'bg-primary-600', legend: '내 땅' },
  unset: {
    fill: palette.primary[300],
    dot: 'bg-primary-300',
    legend: '세팅 필요',
  },
  pending: {
    fill: palette.secondary[400],
    dot: 'bg-secondary-400',
    legend: '새 미션 대기',
  },
};

function statusOf(territory: MyTerritory): LandStatus {
  if (!territory.defense_photo) return 'unset';
  if (territory.pending_adjective) return 'pending';
  return 'owned';
}

interface Props {
  territories: MyTerritory[];
  /** 땅이 없어도 우리 구는 그려 둔다. */
  teamGu: string | undefined;
  onSelect: (dongCode: number) => void;
}

/** 내 땅이 있는 구와 우리 구의 동을 그리고, 내 땅만 색칠해 누르면 그 땅으로 들어간다. */
export default function MyTerritoryMap({ territories, teamGu, onSelect }: Props) {
  const [width, setWidth] = useState(0);

  const gus = new Set<string>();
  if (teamGu) gus.add(teamGu);
  for (const territory of territories) {
    const gu = findDong(territory.dong_code)?.gu;
    if (gu) gus.add(gu);
  }
  const contextDongs = DONGS.filter((dong) => gus.has(dong.gu) && SHAPES[dong.code]);
  const lands = new Map(territories.map((territory) => [territory.dong_code, territory]));

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const dong of contextDongs) {
    for (const [outer] of SHAPES[dong.code]) {
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
  const innerWidth = width - PADDING * 2;
  const height =
    spanX > 0
      ? Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, (innerWidth * spanY) / spanX + PADDING * 2))
      : MIN_HEIGHT;
  const scale = spanX > 0 ? Math.min(innerWidth / spanX, (height - PADDING * 2) / spanY) : 0;
  const offsetX = (width - spanX * scale) / 2;
  const offsetY = (height - spanY * scale) / 2;
  const toX = (lng: number) => offsetX + (lng - minLng) * lngScale * scale;
  const toY = (lat: number) => offsetY + (maxLat - lat) * scale;

  const toPath = (polygons: Polygon[]) =>
    polygons
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

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const statuses = new Set(territories.map(statusOf));

  return (
    <View className="gap-md">
      <View
        onLayout={handleLayout}
        className="w-full overflow-hidden rounded-md border border-gray-200 bg-white"
        style={{ height }}
      >
        {width > 0 && scale > 0 && (
          <Svg width={width} height={height}>
            {contextDongs.map((dong) => {
              const land = lands.get(dong.code);
              if (land) return null;
              return (
                <Path
                  key={dong.code}
                  d={toPath(SHAPES[dong.code])}
                  fill={dong.gu === teamGu ? palette.gray[100] : palette.gray[50]}
                  stroke={palette.gray[300]}
                  strokeWidth={0.5}
                  fillRule="evenodd"
                />
              );
            })}
            {/* 내 땅은 이웃 동 테두리에 가리지 않게 맨 위에 그린다. */}
            {territories.map((territory) => {
              const polygons = SHAPES[territory.dong_code];
              if (!polygons) return null;
              return (
                <Path
                  key={territory.dong_code}
                  d={toPath(polygons)}
                  fill={STATUS_STYLE[statusOf(territory)].fill}
                  stroke="white"
                  strokeWidth={1.5}
                  fillRule="evenodd"
                  onPress={() => onSelect(territory.dong_code)}
                />
              );
            })}
            {/* 붙어 있는 동은 이름표가 겹쳐, 겹치면 위아래로 비켜 놓고 선으로 원래 자리를 잇는다. */}
            {placeLabels(
              territories.flatMap((territory) => {
                const polygons = SHAPES[territory.dong_code];
                if (!polygons) return [];
                const [lng, lat] = labelPoint(polygons);
                return [{ territory, x: toX(lng), y: toY(lat) }];
              }),
              width,
              height,
            ).map(({ territory, x, y, labelY, w }) => {
              const style = STATUS_STYLE[statusOf(territory)];
              const shifted = labelY !== y;
              return (
                <G key={territory.dong_code} onPress={() => onSelect(territory.dong_code)}>
                  {shifted && (
                    <>
                      <Line
                        x1={x}
                        y1={y}
                        x2={x}
                        y2={labelY}
                        stroke={palette.gray[600]}
                        strokeWidth={1}
                      />
                      <Circle cx={x} cy={y} r={2.5} fill={palette.gray[600]} />
                    </>
                  )}
                  <Rect
                    x={x - w / 2}
                    y={labelY - LABEL_HEIGHT / 2}
                    width={w}
                    height={LABEL_HEIGHT}
                    rx={LABEL_HEIGHT / 2}
                    fill="white"
                    stroke={style.fill}
                    strokeWidth={1.5}
                  />
                  <SvgText
                    x={x}
                    y={labelY + LABEL_SIZE / 3}
                    fontSize={LABEL_SIZE}
                    fontFamily="Pretendard-Bold"
                    fill={palette.gray[700]}
                    textAnchor="middle"
                  >
                    {territory.dong_name}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        )}
        {territories.length === 0 && (
          <View className="absolute inset-0 items-center justify-center">
            <Typography variant="body3" className="text-gray-500">
              아직 가진 땅이 없어요
            </Typography>
          </View>
        )}
      </View>

      {territories.length > 0 && (
        <>
          <View className="flex-row flex-wrap gap-md">
            {(['owned', 'unset', 'pending'] as const)
              .filter((status) => statuses.has(status))
              .map((status) => (
                <View key={status} className="flex-row items-center gap-xs">
                  <View className={`h-[10px] w-[10px] rounded-xs ${STATUS_STYLE[status].dot}`} />
                  <Typography variant="caption" className="text-gray-500">
                    {STATUS_STYLE[status].legend}
                  </Typography>
                </View>
              ))}
          </View>
          {/* 작은 동은 지도에서 누르기 어려워 이름으로도 들어갈 수 있게 한다. */}
          <View className="flex-row flex-wrap gap-sm">
            {territories.map((territory) => {
              const status = statusOf(territory);
              return (
                <Pressable
                  key={territory.dong_code}
                  onPress={() => onSelect(territory.dong_code)}
                  className="flex-row items-center gap-xs rounded-full border border-gray-200 bg-white px-md py-sm active:opacity-80"
                >
                  <View className={`h-[8px] w-[8px] rounded-full ${STATUS_STYLE[status].dot}`} />
                  <Typography variant="h4" className="text-gray-700">
                    {territory.dong_name}
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    {status === 'unset'
                      ? STATUS_STYLE.unset.legend
                      : `${territory.defense_score}점`}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
}

/** 가장 큰 조각의 무게중심. 섬이 딸린 동도 본토 위에 이름이 놓인다. */
function labelPoint(polygons: Polygon[]): [number, number] {
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
  return best;
}

interface LabelInput {
  territory: MyTerritory;
  x: number;
  y: number;
}

/** 앞에서 놓은 이름표와 겹치지 않는 가장 가까운 높이를 고른다. 땅이 최대 몇 곳이라 단순 탐색으로 충분하다. */
function placeLabels(inputs: LabelInput[], width: number, height: number) {
  const placed: { left: number; right: number; top: number; bottom: number }[] = [];
  return inputs.map((input) => {
    const w = labelWidth(input.territory.dong_name);
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
    return { territory: input.territory, x, y: input.y, labelY, w };
  });
}
