import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraBackButton() {
  const insets = useSafeAreaInsets();

  const onPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  };

  return (
    <View className="absolute left-0 top-0" style={{ paddingTop: insets.top + 8, paddingLeft: 16 }}>
      <Pressable onPress={onPress} hitSlop={12}>
        <ChevronLeftIcon width={24} height={24} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
