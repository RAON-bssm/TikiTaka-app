import { ImageBackground, Text } from 'react-native';

interface Props {
  title: string;
}

export default function Topic({ title }: Props) {
  return (
    <ImageBackground
      className="items-center justify-center self-stretch mx-[20px] p-md"
      source={require('@/assets/images/topic-bg.webp')}
      resizeMode="contain"
    >
      <Text className="font-title text-xl text-primary-600">{title}</Text>
    </ImageBackground>
  );
}
