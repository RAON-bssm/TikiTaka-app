import { Image } from 'expo-image';
import { View } from 'react-native';

import { resolveLayerSource } from '@/constants/character/assets';
import { LAYERS, type CharacterConfig } from '@/constants/character/types';

interface CharacterProps {
  config: CharacterConfig;
  /** 한 변의 크기(px). 생략하면 부모 크기를 채운다(항상 1:1). */
  size?: number;
  className?: string;
}

// 파츠 캔버스(1440) 중 캐릭터 본체는 중앙 1024 영역에 있고, 바깥 여백은 넓은 헤어용이다.
// 1024 영역이 컨테이너를 채우도록 확대해야 캐릭터가 작아 보이지 않는다(헤어만 밖으로 넘침).
const CANVAS = 1440;
const DESIGN_FRAME = 1024;
const OVERSCALE = CANVAS / DESIGN_FRAME;
// 확대된 레이어를 중앙에 두는 음수 오프셋
const INSET = `${(-(OVERSCALE - 1) / 2) * 100}%`;

/** 파츠를 LAYERS 순서로 겹쳐 합성한다. 모든 파츠가 같은 1:1 캔버스라 겹치기만 하면 정렬된다. */
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
          if (!source) return null; // 미선택 또는 매핑 없음 (예: 뒷머리 없는 헤어)

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
