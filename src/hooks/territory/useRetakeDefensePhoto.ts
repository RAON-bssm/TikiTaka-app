import { useMutation, useQueryClient } from '@tanstack/react-query';

import { territoryKeys } from '@/api/queryKeys';
import { retakeDefensePhoto } from '@/api/territory';

export function useRetakeDefensePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dongCode, imageUri }: { dongCode: number; imageUri: string }) =>
      retakeDefensePhoto(dongCode, imageUri),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: territoryKeys.all });
    },
  });
}
