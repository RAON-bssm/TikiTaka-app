import { queryClient } from '@/api/queryClient';
import { setupQueryPersistence } from '@/api/queryPersister';
import AuthGate from '@/components/auth/AuthGate';
import AppSplash from '@/components/splash/AppSplash';
import { ToastProvider } from '@/components/ui/Toast';
import '@/global.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useEffect(() => setupQueryPersistence(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <AuthGate>
                <Stack screenOptions={{ headerShown: false }} />
              </AuthGate>
              <AppSplash />
            </ToastProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
