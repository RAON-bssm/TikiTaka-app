import { useState } from 'react';
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
  slides?: BannerSlide[];
}

/** 측정한 컨테이너 폭을 한 페이지 폭으로 쓰므로 좌우 여백은 부모가 담당한다. */
export default function Banner({ slides = BANNER_SLIDES }: Props) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isCarousel = slides.length > 1;

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

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
                index === activeIndex ? 'w-lg bg-primary-600' : 'w-xs bg-gray-200'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
