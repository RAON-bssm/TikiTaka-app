import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';
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
        <ChevronLeftIcon width={24} height={24} color="#6E7D94" />
      </Pressable>
      <Typography variant="h3" className="text-gray-600">
        {title}
      </Typography>
    </View>
  );
}
