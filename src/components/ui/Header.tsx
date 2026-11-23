import { router, usePathname } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import SettingIcon from '@/assets/icons/header/setting.svg';
import LogoImage from '@/assets/icons/logo.webp';
import { guardedNavigate } from '@/hooks/navigation/useLeaveGuard';

/**
 * push는 같은 화면이 이미 있어도 스택에 하나 더 쌓아서, 연타하면 프로필이 여러 겹이 된다.
 * - 같은 스택 안(프로필 하위 화면)이나 탭 위에 덮인 게시글 상세: dismissTo로 이미 있는 화면까지 걷어낸다.
 * - 다른 탭: navigate로 탭만 바꾼다. dismissTo(POP_TO)는 탭 네비게이터가 처리하지 못해 아무 일도 일어나지 않는다.
 */
const Header = () => {
  const pathname = usePathname();

  const goTo = (href: '/' | '/profile') => {
    if (pathname === href) return;
    const isAboveTarget = pathname.startsWith('/post/') || pathname.startsWith(`${href}/`);
    guardedNavigate(() => (isAboveTarget ? router.dismissTo(href) : router.navigate(href)));
  };

  return (
    <View className="w-full flex-row items-center justify-between">
      <Pressable onPress={() => goTo('/')} className="active:opacity-70">
        <Image source={LogoImage} className="h-8 w-[124px]" resizeMode="contain" />
      </Pressable>

      <Pressable onPress={() => goTo('/profile')} className="active:opacity-70">
        <SettingIcon width={32} height={32} />
      </Pressable>
    </View>
  );
};

export default Header;
