import { Tabs } from 'expo-router';

import AppBar from '@/components/ui/AppBar';
import Header from '@/components/ui/header';
import { View } from 'react-native';

export default function TabsLayout() {
  return (
    <View className="flex-1">
      <Header />
      <Tabs tabBar={(props) => <AppBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: '홈' }} />
        <Tabs.Screen name="ranking" options={{ title: '랭킹' }} />
        <Tabs.Screen name="camera" options={{ title: '카메라' }} />
        <Tabs.Screen name="feed" options={{ title: '피드' }} />
        <Tabs.Screen name="market" options={{ title: '상점' }} />
      </Tabs>
    </View>
  );
}
