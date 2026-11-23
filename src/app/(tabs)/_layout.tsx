import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import TutorialProvider from '@/components/tutorial/TutorialProvider';
import AppBar from '@/components/ui/AppBar';
import { useMyPosts } from '@/hooks/post/useMyPosts';
import { useAnalyticsUserId } from '@/hooks/user/useAnalyticsUserId';

export default function TabsLayout() {
  useMyPosts();
  useAnalyticsUserId();

  return (
    <TutorialProvider>
      <View className="flex-1">
        <Tabs tabBar={(props) => <AppBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" options={{ title: '홈' }} />
          <Tabs.Screen name="ranking" options={{ title: '랭킹' }} />
          <Tabs.Screen name="camera" options={{ title: '카메라' }} />
          <Tabs.Screen name="map" options={{ title: '지도', lazy: Platform.OS !== 'android' }} />
          <Tabs.Screen name="market" options={{ title: '상점' }} />
          <Tabs.Screen name="feed" options={{ title: '피드' }} />
          {/* 하단 탭바에는 없고 헤더 버튼으로 들어간다. 떠날 때 설정 등 하위 화면을 비워, 다시 들어오면 항상 프로필부터 보인다. */}
          <Tabs.Screen name="profile" options={{ title: '프로필', popToTopOnBlur: true }} />
        </Tabs>
        <TutorialOverlay />
      </View>
    </TutorialProvider>
  );
}
