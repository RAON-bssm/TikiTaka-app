import { useEffect, useState } from 'react';
import { Image } from 'react-native';

// 이미지 비율(width / height). 렌더 전에 Image.getSize로 받아와, 높이 0으로 무너져
// onLoad가 걸리지 않는 문제를 피한다. 로딩 전·실패 시 undefined.
export default function useImageRatio(uri?: string) {
  // uri와 함께 저장해 uri가 바뀌면 이전 비율이 노출되지 않게 한다.
  // (effect 본문에서 동기 setState를 하지 않기 위한 구조)
  const [resolved, setResolved] = useState<{ uri: string; ratio: number }>();

  useEffect(() => {
    if (!uri) return;

    let active = true;
    Image.getSize(
      uri,
      (width, height) => {
        if (active && width && height) setResolved({ uri, ratio: width / height });
      },
      () => {
        // 실패 시 resolved.uri가 현재 uri와 달라 자연스럽게 undefined가 반환된다.
      },
    );

    return () => {
      active = false;
    };
  }, [uri]);

  return resolved && resolved.uri === uri ? resolved.ratio : undefined;
}
