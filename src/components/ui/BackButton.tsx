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
    } else if (router.canGoBack()) {
      router.back();
    } else {
      // 탭을 새로 열며 바로 들어온 화면은 스택에 이전 화면이 없어 back이 아무 일도 하지 않는다.
      router.replace('/');
    }
  };
  return (
    <View className="flex flex-row items-center gap-sm">
      <Pressable onPress={onPress}>
        <ChevronLeftIcon width={24} height={24} color="#6E7D94" />
      </Pressable>
      <Typography variant="h3" className="text-gray-500">
        {title}
      </Typography>
    </View>
  );
}
