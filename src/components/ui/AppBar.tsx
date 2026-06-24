import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { Image, Pressable, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Typography from './Typography';

type TabConfig = {
  label: string;
  icon: ImageSourcePropType;
};

// 라우트 이름(파일명) -> 바텀바 표시 정보. require는 정적 경로여야 하므로 맵으로 관리합니다.
const TAB_CONFIG: Record<string, TabConfig> = {
  index: { label: '홈', icon: require('@/assets/icons/app-var/home.svg') },
  feed: { label: '피드', icon: require('@/assets/icons/app-var/feed.svg') },
  ranking: { label: '랭킹', icon: require('@/assets/icons/app-var/ranking.svg') },
  camera: { label: '카메라', icon: require('@/assets/icons/app-var/camera.svg') },
};

const AppBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row border-t border-gray-200 bg-white"
      style={{ paddingBottom: insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        // TAB_CONFIG에 없는 라우트(상세 페이지 등)는 바텀바에 노출하지 않습니다.
        if (!config) return null;

        const focused = state.index === index;

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
            <Image
              source={config.icon}
              className="object-contain"
              style={{ width: 24, height: 24, opacity: focused ? 1 : 0.4 }}
            />
            <Typography
              variant="caption"
              className={focused ? 'text-primary-600' : 'text-gray-500'}
            >
              {config.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
};

export default AppBar;
