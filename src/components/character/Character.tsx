import { Image } from 'expo-image';
import { View } from 'react-native';

import { resolveLayerSource } from '@/constants/character/assets';
import { LAYERS, type CharacterConfig } from '@/constants/character/types';

interface CharacterProps {
  /** 그릴 캐릭터 구성 (파츠 id들의 집합) */
  config: CharacterConfig;
  /** 한 변의 크기(px). 생략하면 부모 크기를 채운다. 비율은 항상 1:1로 유지된다. */
  size?: number;
  className?: string;
}

/**
 * 파츠 캔버스는 1440이지만, 캐릭터 본체(머리·몸)는 중앙 1024 "디자인 프레임"에 그려져 있고
 * 바깥 여백(각 208px)은 넓은 헤어가 삐져나올 여유 공간이다.
 * 화면에는 이 디자인 프레임(1024)이 컨테이너를 꽉 채우도록 확대해서 그린다.
 * → 여백 때문에 캐릭터가 작아 보이지 않고, 넓은 헤어만 프레임 밖으로 넘친다.
 */
const CANVAS = 1440; // 파츠 webp 실제 크기
const DESIGN_FRAME = 1024; // 캐릭터 본체가 놓인 중앙 영역
const OVERSCALE = CANVAS / DESIGN_FRAME; // 1.40625
// 확대된 레이어를 중앙 정렬하기 위한 음수 오프셋: (100% - OVERSCALE*100%) / 2
const INSET = `${(-(OVERSCALE - 1) / 2) * 100}%`;

/**
 * 파츠 이미지를 정사각형 컨테이너 안에 순서대로 쌓아 캐릭터를 합성한다.
 *
 * - 모든 파츠는 동일한 1:1 캔버스 기준이라 `absolute` + 전체 채우기 + `contain`만으로 정렬된다.
 * - 크기는 `size` prop 하나로 제어하며, `aspect-square`가 비율을 보장한다.
 *   (아바타 48px ~ 커스터마이징 300px 등 어디서든 동일 컴포넌트 재사용)
 * - 내부 레이어는 디자인 프레임(1024)이 박스를 채우도록 OVERSCALE 배 확대해 그린다.
 */
export default function Character({ config, size, className }: CharacterProps) {
  return (
    <View
      className={`aspect-square ${className ?? ''}`}
      style={size ? { width: size, height: size } : undefined}
    >
      <View
        style={{
          position: 'absolute',
          top: INSET,
          left: INSET,
          width: `${OVERSCALE * 100}%`,
          height: `${OVERSCALE * 100}%`,
        }}
      >
        {LAYERS.map((layer) => {
          const source = resolveLayerSource(config, layer);
          if (!source) return null; // 파츠 미선택 또는 매핑된 파일 없음 (예: 뒷머리 없는 헤어)

          return (
            <Image
              key={'tint' in layer ? layer.tint : layer.group}
              source={source}
              contentFit="contain"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          );
        })}
      </View>
    </View>
  );
}
