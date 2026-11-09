import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';

// 원본 카메라 사진(수 MB)은 서버가 413으로 거부할 수 있어 축소·재압축해서 올린다.
const UPLOAD_IMAGE_MAX_WIDTH = 1440;
const UPLOAD_IMAGE_COMPRESS = 0.7;

export async function compressImageForUpload(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  let image: ImageRef | undefined;

  try {
    context.resize({ width: UPLOAD_IMAGE_MAX_WIDTH });
    image = await context.renderAsync();
    const result = await image.saveAsync({
      compress: UPLOAD_IMAGE_COMPRESS,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } finally {
    image?.release();
    context.release();
  }
}

/** RN FormData의 파일 파트. 파트 이름은 서버 DTO와 정확히 같아야 한다. */
export async function appendImage(formData: FormData, uri: string, field = 'image') {
  const compressedUri = await compressImageForUpload(uri);
  const fileName = compressedUri.split('/').pop() ?? `photo-${Date.now()}.jpg`;
  formData.append(field, {
    uri: compressedUri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);
}

/**
 * Content-Type을 'multipart/form-data'로 박으면 boundary가 빠져 400이 난다.
 * undefined로 기본값(application/json)을 해제해 RN이 boundary 포함 헤더를 만들게 한다.
 */
export const MULTIPART_HEADERS = { 'Content-Type': undefined };
