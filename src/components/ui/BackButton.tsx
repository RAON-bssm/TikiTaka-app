import { router, type Href } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import Typography from './Typography';

interface Props {
  link?: Href;
  title: string;
}

export default function BackButton({ link, title }: Props) {
  const onPress = () => {
    if (link) {
      router.push(link);
    } else {
      router.back();
    }
  };
  return (
    <View className="flex flex-row items-center gap-sm">
      <Pressable onPress={onPress}>
        <Image
          source={require('@/assets/icons/chevron-left.svg')}
          style={{ width: 24, height: 24, resizeMode: 'contain' }}
        />
      </Pressable>
      <Typography variant="h3" className="text-gray-600">
        {title}
      </Typography>
    </View>
  );
}
