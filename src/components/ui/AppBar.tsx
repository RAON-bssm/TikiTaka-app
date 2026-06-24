import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import type { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import CameraIcon from '@/assets/icons/app-var/camera.svg';
import FeedIcon from '@/assets/icons/app-var/feed.svg';
import HomeIcon from '@/assets/icons/app-var/home.svg';
import MarketIcon from '@/assets/icons/app-var/market.svg';
import RankingIcon from '@/assets/icons/app-var/ranking.svg';

type TabConfig = {
  label: string;
  Icon: FC<SvgProps>;
};

// SVG fill은 currentColor라서 color prop으로 제어합니다. (tailwind.config.js 값과 일치)
const COLOR_FOCUSED = '#FC8253'; // primary-600
const COLOR_DEFAULT = '#9DAABB'; // gray-500

// 라우트 이름(파일명) -> 바텀바 표시 정보. SVG는 컴포넌트로 import 합니다.
// 노출 순서는 (tabs)/_layout.tsx의 Tabs.Screen 선언 순서를 따릅니다.
const TAB_CONFIG: Record<string, TabConfig> = {
  index: { label: '홈', Icon: HomeIcon },
  ranking: { label: '랭킹', Icon: RankingIcon },
  camera: { label: '카메라', Icon: CameraIcon },
  feed: { label: '피드', Icon: FeedIcon },
  market: { label: '상점', Icon: MarketIcon },
};

const AppBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-row bg-white" style={{ paddingBottom: insets.bottom }}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        // TAB_CONFIG에 없는 라우트(상세 페이지 등)는 바텀바에 노출하지 않습니다.
        if (!config) return null;

        const focused = state.index === index;
        const Icon = config.Icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center justify-center gap-xs py-sm active:opacity-70"
          >
            <Icon width={24} height={24} color={focused ? COLOR_FOCUSED : COLOR_DEFAULT} />
            <Text
              className={`font-medium text-[10px] leading-[15px] ${focused ? 'text-primary-600' : 'text-gray-500'}`}
            >
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default AppBar;
