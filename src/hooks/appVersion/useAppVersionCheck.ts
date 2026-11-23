import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { getAppVersion } from '@/api/appVersion';
import { appVersionKeys } from '@/api/queryKeys';
import type { AppPlatform } from '@/types/appVersion';

const platform: AppPlatform = Platform.OS === 'ios' ? 'ios' : 'android';
// expo-updates를 쓰지 않아 빌드에 박힌 app.json `version`이 곧 설치된 바이너리 버전이다.
const currentVersion = Constants.expoConfig?.version;

/** 실행당 한 번만 확인한다. 업데이트하면 앱이 다시 시작되므로 그 사이에 결과가 바뀔 일이 없다. */
export function useAppVersionCheck() {
  return useQuery({
    queryKey: appVersionKeys.check(platform, currentVersion),
    queryFn: () => getAppVersion({ platform, current_version: currentVersion! }),
    enabled: !!currentVersion,
    staleTime: Infinity,
  });
}
