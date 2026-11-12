import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

import TutorialOverlay from '@/components/tutorial/TutorialOverlay';
import TutorialProvider from '@/components/tutorial/TutorialProvider';
import AppBar from '@/components/ui/AppBar';
import { useMyPosts } from '@/hooks/post/useMyPosts';

export default function TabsLayout() {
  useMyPosts();

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
        </Tabs>
        <TutorialOverlay />
      </View>
    </TutorialProvider>
  );
}
