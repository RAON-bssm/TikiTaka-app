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
        // 일급은 새벽 배치로 들어와, 앱에 남아 있던 내역·포인트 캐시는 지급 전 값이다.
        if (type === 'WAGE') {
          queryClient.invalidateQueries({ queryKey: territoryKeys.all });
          queryClient.invalidateQueries({ queryKey: userKeys.all });
        }
        setOpenedType(type);
      }),
    [queryClient],
  );

  return { openedType, clear: () => setOpenedType(undefined) };
}
