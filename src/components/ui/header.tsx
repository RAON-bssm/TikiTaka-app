import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NotificationsIcon from '@/assets/icons/header/notifications.svg';
import ProfileImageIcon from '@/assets/icons/header/ProfileImage.svg';
import VectorIcon from '@/assets/icons/header/Vector.svg';
import LogoImage from '@/assets/icons/logo.webp';

const COLOR_ICON = '#9DAABB'; // gray-500

const Header = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row items-center justify-between">
      <Pressable onPress={() => router.push('/(tabs)')} className="active:opacity-70">
        <Image source={LogoImage} className="h-8 w-[124px]" resizeMode="contain" />
      </Pressable>

      <View className="flex-row items-center gap-md">
        <Pressable className="active:opacity-70">
          <NotificationsIcon width={24} height={24} color={COLOR_ICON} />
        </Pressable>

        <Pressable className="active:opacity-70">
          <VectorIcon width={24} height={24} color={COLOR_ICON} />
        </Pressable>

        <Pressable className="active:opacity-70">
          <ProfileImageIcon width={32} height={32} />
        </Pressable>
      </View>
    </View>
  );
};

export default Header;
