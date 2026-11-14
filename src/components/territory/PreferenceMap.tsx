import { useMemo, useState } from 'react';
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

function buildShapes(dongs: Dong[], width: number) {
  const drawable = dongs.filter((dong) => hasShape(dong.code));
  const { height, scale, toPath, labelPoint } = projectDongs(
    drawable.map((dong) => dong.code),
    width,
    MAP_OPTIONS,
  );
  const shapes = drawable.map((dong) => ({
    code: dong.code,
    name: dong.name,
    path: toPath(dong.code),
    label: labelPoint(dong.code),
  }));
  return { height, scale, shapes };
}

export default function PreferenceMap({ dongs, codes, onToggle }: Props) {
  const [width, setWidth] = useState(0);
  // 경로 문자열은 구 전체 좌표를 훑어 만들어 비싸다. React Compiler는 이 계산을 고를 때마다 바뀌는 `codes`와
  // 한 캐시로 묶어(컴파일 결과로 확인) 동을 누를 때마다 다시 만들므로, `dongs`·`width`에만 묶어 직접 메모한다.
  const { height, scale, shapes } = useMemo(() => buildShapes(dongs, width), [dongs, width]);

  const selected = codes.flatMap((code, priority) => {
    const shape = shapes.find((item) => item.code === code);
    return shape?.label
      ? [{ code, priority, text: `${priority + 1}지망 ${shape.name}`, ...shape.label }]
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
          {shapes.map(({ code, path }) => {
            const priority = codes.indexOf(code);
            const isSelected = priority >= 0;
            return (
              <Path
                key={code}
                d={path}
                fill={isSelected ? palette.primary[600] : palette.gray[50]}
                fillOpacity={isSelected ? PRIORITY_OPACITY[priority] : 1}
                stroke={isSelected ? 'white' : palette.gray[300]}
                strokeWidth={isSelected ? 1.5 : 0.75}
                fillRule="evenodd"
                onPress={() => onToggle(code)}
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
