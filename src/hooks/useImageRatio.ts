import { useEffect, useState } from 'react';
import { Image } from 'react-native';

// 이미지 uri의 가로세로 비율(width / height)을 반환하는 훅.
// - 가로는 부모 폭으로 고정하고 세로만 원본 비율에 맞춰 유동적으로 그릴 때 사용합니다.
// - 렌더 전에 Image.getSize로 원본 크기를 먼저 받아오므로, 높이 0으로 무너져
//   onLoad가 걸리지 않는 문제를 피할 수 있습니다.
// - uri가 없거나 로딩 전/실패 시에는 undefined를 반환합니다.
export default function useImageRatio(uri?: string) {
  // 비율을 소속 uri와 함께 저장해, uri가 바뀌면 이전 값이 잘못 노출되지 않도록 합니다.
  // (effect 본문에서 동기적으로 setState를 호출하지 않기 위한 구조)
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
        // 실패 시 별도 처리 없음: uri 불일치로 자연스럽게 undefined가 반환됩니다.
      },
    );

    return () => {
      active = false;
    };
  }, [uri]);

  // 현재 uri에 해당하는 비율만 반환 (로딩 전·uri 변경 직후·실패 시 undefined)
  return resolved && resolved.uri === uri ? resolved.ratio : undefined;
}
