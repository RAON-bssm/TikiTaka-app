import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { subscribeForegroundNotification } from '@/api/pushNotification';
import { territoryKeys, userKeys } from '@/api/queryKeys';
import { useToast } from '@/components/ui/Toast';

const FOREGROUND_TOAST_MS = 4000;

/** 앱을 보고 있는 중에 온 알림을 토스트로 알린다. iOS는 시스템 배너가 떠서 Android에서만 동작한다. */
export function useForegroundPushToast() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(
    () =>
      subscribeForegroundNotification(({ type, text }) => {
        // 일급은 새벽 배치로 들어와, 화면에 떠 있던 내역·포인트는 지급 전 값이다.
        if (type === 'WAGE') {
          queryClient.invalidateQueries({ queryKey: territoryKeys.all });
          queryClient.invalidateQueries({ queryKey: userKeys.all });
        }
        showToast(text, { duration: FOREGROUND_TOAST_MS });
      }),
    [queryClient, showToast],
  );
}
