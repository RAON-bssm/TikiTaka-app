import { useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { palette } from '@/constants/colors';
import type { Dong } from '@/constants/territory/dongs';
import { hasShape, LABEL_HEIGHT, LABEL_SIZE, placeLabels, projectDongs } from './dongMap';

const MAP_OPTIONS = { padding: 12, minHeight: 200, maxHeight: 300 };
/** 지망이 낮을수록 옅게 칠해 순서가 지도에서도 보이게 한다. */
const PRIORITY_OPACITY = [1, 0.7, 0.45];

interface Props {
  dongs: Dong[];
  /** 지망 순서대로 고른 동 코드 */
  codes: number[];
  onToggle: (code: number) => void;
}

export default function PreferenceMap({ dongs, codes, onToggle }: Props) {
  const [width, setWidth] = useState(0);
  const drawable = dongs.filter((dong) => hasShape(dong.code));
  const { height, scale, toPath, labelPoint } = projectDongs(
    drawable.map((dong) => dong.code),
    width,
    MAP_OPTIONS,
  );

  const selected = codes.flatMap((code, priority) => {
    const dong = drawable.find((item) => item.code === code);
    const point = dong && labelPoint(code);
    return dong && point
      ? [{ code, priority, text: `${priority + 1}지망 ${dong.name}`, ...point }]
      : [];
  });

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={handleLayout}
      className="w-full overflow-hidden rounded-md border border-gray-200 bg-white"
      style={{ height }}
    >
      {width > 0 && scale > 0 && (
        <Svg width={width} height={height}>
          {drawable.map((dong) => {
            const priority = codes.indexOf(dong.code);
            const isSelected = priority >= 0;
            return (
              <Path
                key={dong.code}
                d={toPath(dong.code)}
                fill={isSelected ? palette.primary[600] : palette.gray[50]}
                fillOpacity={isSelected ? PRIORITY_OPACITY[priority] : 1}
                stroke={isSelected ? 'white' : palette.gray[300]}
                strokeWidth={isSelected ? 1.5 : 0.75}
                fillRule="evenodd"
                onPress={() => onToggle(dong.code)}
              />
            );
          })}
          {placeLabels(selected, width, height).map(({ code, x, y, labelY, w, text }) => {
            const shifted = labelY !== y;
            return (
              <G key={code} onPress={() => onToggle(code)}>
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
                  stroke={palette.primary[600]}
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
                  {text}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      )}
    </View>
  );
}
