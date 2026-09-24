import { Image, ImageBackground, Text } from 'react-native';

interface Props {
  title: string;
}

// w-full + aspectRatio로 부모 폭을 채우면서 배경 원본 비율을 유지한다.
const TOPIC_BG = require('@/assets/images/topic-bg.webp');
const { width, height } = Image.resolveAssetSource(TOPIC_BG);
const TOPIC_ASPECT_RATIO = width / height;

export default function Topic({ title }: Props) {
  return (
    <ImageBackground
      className="w-full items-center justify-center overflow-hidden"
      style={{ aspectRatio: TOPIC_ASPECT_RATIO }}
      source={TOPIC_BG}
      resizeMode="cover"
    >
      {/* 배경 상단 탭 모양 때문에 아래로 내린다. margin은 justify-center 정렬을 흔들어 transform을 쓴다. */}
      <Text
        className="font-title text-xl text-primary-600"
        style={{ transform: [{ translateY: 10 }] }}
      >
        {title}
      </Text>
    </ImageBackground>
  );
}
