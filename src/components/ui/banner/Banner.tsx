import { useCallback, useState } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  View,
} from 'react-native';

import { BANNER_SLIDES, type BannerSlide } from '@/constants/banner';
import BannerCard from './BannerCard';

interface Props {
  /** 표시할 배너 목록. 기본값은 공용 BANNER_SLIDES. */
  slides?: BannerSlide[];
}

/**
 * 홈 상단 배너.
 *
 * 슬라이드 데이터(`slides`)를 그대로 페이징 캐러셀로 그리고, 하단 인디케이터 점 개수도
 * 데이터에서 자동으로 파생된다. 배너를 늘리려면 `BANNER_SLIDES`에 항목만 추가하면 된다.
 * 컨테이너의 가용 너비(onLayout)를 한 페이지 폭으로 사용하므로 좌우 여백은 부모가 담당한다.
 */
export default function Banner({ slides = BANNER_SLIDES }: Props) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isCarousel = slides.length > 1;

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width === 0) return;
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    },
    [width],
  );

  return (
    <View className="w-full" onLayout={handleLayout}>
      {width > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          scrollEnabled={isCarousel}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide) => (
            <View key={slide.id} style={{ width }}>
              <BannerCard slide={slide} />
            </View>
          ))}
        </ScrollView>
      )}

      {isCarousel && (
        <View className="mt-xs flex-row items-center justify-center gap-xs">
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              className={`h-xs rounded-full ${
                index === activeIndex ? 'w-lg bg-primary-600' : 'w-xs bg-gray-300'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
