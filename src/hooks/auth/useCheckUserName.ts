import { useMutation } from '@tanstack/react-query';

import { checkUserName } from '@/api/auth';

/** 버튼을 눌렀을 때만 확인하고 결과를 캐시할 이유가 없어 쿼리 대신 mutation으로 둔다. */
export function useCheckUserName() {
  return useMutation({
    mutationFn: checkUserName,
  });
}
