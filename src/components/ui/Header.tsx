import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import NotificationsIcon from '@/assets/icons/header/notifications.svg';
import ProfileImageIcon from '@/assets/icons/header/ProfileImage.svg';
import VectorIcon from '@/assets/icons/header/Vector.svg';
import LogoImage from '@/assets/icons/logo.webp';
import { palette } from '@/constants/colors';
import { useLogout } from '@/hooks/auth/useLogout';
import MoreMenu from './MoreMenu';

const COLOR_ICON = palette.gray[400];

const Header = () => {
  const logout = useLogout();

  return (
    <View className="w-full flex-row items-center justify-between">
      <Pressable onPress={() => router.push('/(tabs)')} className="active:opacity-70">
        <Image source={LogoImage} className="h-8 w-[124px]" resizeMode="contain" />
      </Pressable>

      <View className="flex-row items-center gap-md">
        <Pressable className="active:opacity-70">
          <NotificationsIcon width={24} height={24} color={COLOR_ICON} />
        </Pressable>

        <MoreMenu
          icon={VectorIcon}
          iconColor={COLOR_ICON}
          items={[{ label: '로그아웃', destructive: true, onPress: () => logout.mutate() }]}
        />

        <Pressable onPress={() => router.push('/(tabs)/profile')} className="active:opacity-70">
          <ProfileImageIcon width={32} height={32} />
        </Pressable>
      </View>
    </View>
  );
};

export default Header;
