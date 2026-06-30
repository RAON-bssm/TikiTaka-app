import { Image, ImageBackground, Text } from 'react-native';

interface Props {
  title: string;
}

// 배경 이미지의 원본 크기를 읽어 가로:세로 비율을 구합니다.
// w-full + aspectRatio 조합으로, 부모 폭을 채우면서 높이는 원본 비율대로 유지됩니다.
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
      {/* 배너 상단 탭 모양 때문에 텍스트를 중앙보다 살짝 아래로 내립니다. (디자인: center +8px) */}
      <Text className="mt-sm font-title text-xl text-primary-600">{title}</Text>
    </ImageBackground>
  );
}
