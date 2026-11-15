import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { DONGS } from '@/constants/territory/dongs';
import { findDong } from '@/constants/territory/region';
import type { MyTerritory } from '@/types/territory';
import { hasShape, LABEL_HEIGHT, LABEL_SIZE, placeLabels, projectDongs } from './dongMap';

const MAP_OPTIONS = { padding: 12, minHeight: 200, maxHeight: 320 };

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

export default function MyTerritoryMap({ territories, teamGu, onSelect }: Props) {
  const [width, setWidth] = useState(0);

  const gus = new Set<string>();
  if (teamGu) gus.add(teamGu);
  for (const territory of territories) {
    const gu = findDong(territory.dong_code)?.gu;
    if (gu) gus.add(gu);
  }
  const contextDongs = DONGS.filter((dong) => gus.has(dong.gu) && hasShape(dong.code));
  const lands = new Map(territories.map((territory) => [territory.dong_code, territory]));
  const { height, scale, toPath, labelPoint } = projectDongs(
    contextDongs.map((dong) => dong.code),
    width,
    MAP_OPTIONS,
  );

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
                  d={toPath(dong.code)}
                  fill={dong.gu === teamGu ? palette.gray[100] : palette.gray[50]}
                  stroke={palette.gray[300]}
                  strokeWidth={0.5}
                  fillRule="evenodd"
                />
              );
            })}
            {/* 내 땅은 이웃 동 테두리에 가리지 않게 맨 위에 그린다. */}
            {territories.map((territory) => {
              if (!hasShape(territory.dong_code)) return null;
              return (
                <Path
                  key={territory.dong_code}
                  d={toPath(territory.dong_code)}
                  fill={STATUS_STYLE[statusOf(territory)].fill}
                  stroke="white"
                  strokeWidth={1.5}
                  fillRule="evenodd"
                  onPress={() => onSelect(territory.dong_code)}
                />
              );
            })}
            {placeLabels(
              territories.flatMap((territory) => {
                const point = labelPoint(territory.dong_code);
                return point ? [{ territory, text: territory.dong_name, ...point }] : [];
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
