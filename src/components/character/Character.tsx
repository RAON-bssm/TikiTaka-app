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
 * 파츠 이미지를 정사각형 컨테이너 안에 순서대로 쌓아 캐릭터를 합성한다.
 *
 * - 모든 파츠는 동일한 1:1 캔버스 기준이라 `absolute` + 전체 채우기 + `contain`만으로 정렬된다.
 * - 크기는 `size` prop 하나로 제어하며, `aspect-square`가 비율을 보장한다.
 *   (아바타 48px ~ 커스터마이징 300px 등 어디서든 동일 컴포넌트 재사용)
 */
export default function Character({ config, size, className }: CharacterProps) {
  return (
    <View
      className={`aspect-square ${className ?? ''}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {LAYERS.map((layer) => {
        const source = resolveLayerSource(config, layer);
        if (!source) return null; // 파츠 미선택 또는 매핑된 파일 없음 (예: 뒷머리 없는 헤어)

        return (
          <Image
            key={layer.group}
            source={source}
            contentFit="contain"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        );
      })}
    </View>
  );
}
