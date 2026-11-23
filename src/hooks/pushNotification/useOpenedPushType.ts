import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { subscribeNotificationOpen } from '@/api/pushNotification';
import { territoryKeys, userKeys } from '@/api/queryKeys';
import type { PushType } from '@/types/pushNotification';

/** 눌러서 들어온 알림의 종류. 팝업을 닫으면 `clear`로 비운다. */
export function useOpenedPushType() {
  const queryClient = useQueryClient();
  const [openedType, setOpenedType] = useState<PushType>();

  useEffect(
    () =>
      subscribeNotificationOpen((type) => {
        // 일급·땅 뺏김은 서버에서 바뀐 결과라, 앱에 남아 있던 내역·포인트 캐시는 그 전 값이다.
        if (type === 'DAILY_WAGE') queryClient.invalidateQueries({ queryKey: userKeys.all });
        queryClient.invalidateQueries({ queryKey: territoryKeys.all });
        setOpenedType(type);
      }),
    [queryClient],
  );

  return { openedType, clear: () => setOpenedType(undefined) };
}
