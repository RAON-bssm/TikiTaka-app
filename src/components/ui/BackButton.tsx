import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';
import Typography from './Typography';

interface Props {
  link?: Href;
  title: string;
  disabled?: boolean;
}

export default function BackButton({ link, title, disabled = false }: Props) {
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
  // hitSlop은 부모 경계를 넘지 못한다. 패딩만큼 음수 마진을 줘 보이는 위치는 그대로 두고 터치 영역을 부모 안에 확보한다.
  return (
    <View className="-m-sm flex flex-row items-center gap-sm p-sm">
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="뒤로 가기"
        accessibilityState={{ disabled }}
      >
        <ChevronLeftIcon width={24} height={24} color="#6E7D94" />
      </Pressable>
      <Typography variant="h3" className="text-gray-500">
        {title}
      </Typography>
    </View>
  );
}
