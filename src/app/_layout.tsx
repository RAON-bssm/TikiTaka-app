import { queryClient } from '@/api/queryClient';
import { persistOptions } from '@/api/queryPersister';
import AuthGate from '@/components/auth/AuthGate';
import { CameraPermissionProvider } from '@/components/camera/CameraPermissionGate';
import AppSplash from '@/components/splash/AppSplash';
import { ToastProvider } from '@/components/ui/Toast';
import '@/global.css';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            <ToastProvider>
              <CameraPermissionProvider>
                <AuthGate>
                  <Stack screenOptions={{ headerShown: false }} />
                </AuthGate>
              </CameraPermissionProvider>
              <AppSplash />
            </ToastProvider>
          </PersistQueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
