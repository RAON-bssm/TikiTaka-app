import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Skeleton from '@/components/ui/feedback/Skeleton';
import { useMapBridge } from '@/hooks/map/useMapBridge';
import { useMyInfo } from '@/hooks/user/useMyInfo';
import type { Neighborhood } from '@/types/mapBridge';

const MAP_WEB_URL = process.env.EXPO_PUBLIC_MAP_WEB_URL;

export default function MapScreen() {
  const myInfo = useMyInfo();
  const mainLocation = myInfo.data?.main_location;
  const neighborhood: Neighborhood | null = mainLocation
    ? {
        locationId: mainLocation.location_id,
        cityName: mainLocation.location_city_name,
        name: mainLocation.location_name,
      }
    : null;

  const { webViewRef, status, onMessage, fail, reload } = useMapBridge({ neighborhood });

  if (!MAP_WEB_URL) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-gray-50" edges={['top']}>
        <ErrorRetry message="EXPO_PUBLIC_MAP_WEB_URL이 설정되지 않았어요." onRetry={reload} />
      </SafeAreaView>
    );
  }

  const isError = status === 'error' || myInfo.isError;
  const onRetry = () => {
    if (myInfo.isError) void myInfo.refetch();
    reload();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <WebView
        ref={webViewRef}
        source={{ uri: MAP_WEB_URL }}
        onMessage={onMessage}
        onError={fail}
        onHttpError={fail}
        // 메모리 부족 등으로 WebView 프로세스가 종료되면 흰 화면으로 남으므로 다시 띄운다.
        onContentProcessDidTerminate={reload}
        onRenderProcessGone={reload}
        setSupportMultipleWindows={false}
        webviewDebuggingEnabled={__DEV__}
      />

      {/* WebView는 로드가 계속돼야 하므로 언마운트하지 않고 위에 덮는다. */}
      {isError ? (
        <View className="absolute inset-0 justify-center bg-gray-50">
          <ErrorRetry message="지도를 불러오지 못했어요." onRetry={onRetry} />
        </View>
      ) : (
        status === 'loading' && <Skeleton className="absolute inset-0" />
      )}
    </SafeAreaView>
  );
}
