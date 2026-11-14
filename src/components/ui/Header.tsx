import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import SettingIcon from '@/assets/icons/header/setting.svg';
import LogoImage from '@/assets/icons/logo.webp';
import { guardedNavigate } from '@/hooks/navigation/useLeaveGuard';

const Header = () => {
  return (
    <View className="w-full flex-row items-center justify-between">
      <Pressable
        onPress={() => guardedNavigate(() => router.push('/(tabs)'))}
        className="active:opacity-70"
      >
        <Image source={LogoImage} className="h-8 w-[124px]" resizeMode="contain" />
      </Pressable>

      <Pressable
        onPress={() => guardedNavigate(() => router.push('/(tabs)/profile'))}
        className="active:opacity-70"
      >
        <SettingIcon width={32} height={32} />
      </Pressable>
    </View>
  );
};

export default Header;
