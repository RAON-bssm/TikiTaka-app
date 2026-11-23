import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { subscribeForegroundNotification } from '@/api/pushNotification';
import { territoryKeys, userKeys } from '@/api/queryKeys';
import { useToast } from '@/components/ui/Toast';

const FOREGROUND_TOAST_MS = 4000;

/** 앱을 보고 있는 중에 온 알림으로 캐시를 갱신하고, Android에서는 토스트로 알린다(iOS는 시스템 배너가 뜬다). */
export function useForegroundPushToast() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(
    () =>
      subscribeForegroundNotification(({ type, text }) => {
        // 일급·땅 뺏김은 서버에서 바뀐 결과라, 화면에 떠 있던 내역·포인트는 그 전 값이다.
        if (type === 'DAILY_WAGE') queryClient.invalidateQueries({ queryKey: userKeys.all });
        if (type) queryClient.invalidateQueries({ queryKey: territoryKeys.all });
        if (Platform.OS === 'android' && text) showToast(text, { duration: FOREGROUND_TOAST_MS });
      }),
    [queryClient, showToast],
  );
}
