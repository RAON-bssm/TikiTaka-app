import { useMutation } from '@tanstack/react-query';

import { savePostImage } from '@/api/photoSave';

export function useSavePostImage() {
  return useMutation({ mutationFn: savePostImage });
}
