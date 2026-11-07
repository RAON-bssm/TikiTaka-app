import { useMutation, useQueryClient } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { updateMission } from '@/api/territory';
import type { UpdateMissionRequest } from '@/types/territory';

/** 대기 미션으로만 저장된다. 성공하면 곧바로 대표 사진 재촬영으로 이어가야 적용된다. */
export function useUpdateMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dongCode, ...req }: UpdateMissionRequest & { dongCode: number }) =>
      updateMission(dongCode, req),
    onSuccess: (_, { dongCode }) => {
      queryClient.invalidateQueries({ queryKey: territoryKeys.detail(dongCode) });
      queryClient.invalidateQueries({ queryKey: territoryKeys.mine() });
    },
  });
}
