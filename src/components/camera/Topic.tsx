import { ImageBackground, Text } from 'react-native';

interface props {
  topic: string;
}

export default function Topic({ topic }: props) {
  return (
    <ImageBackground source={require('@/assets/images/topic-bg.webp')}>
      <Text className="font-title text-xl text-primary-600">{topic}</Text>
    </ImageBackground>
  );
}
