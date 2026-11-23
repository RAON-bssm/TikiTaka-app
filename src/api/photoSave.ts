import { File, Paths } from 'expo-file-system';
import { Asset, requestPermissionsAsync } from 'expo-media-library';

import { getViewUrl } from './storage';

/** 사용자가 사진 저장 권한을 거절했다. 화면에서 설정 안내를 보여 줄 때 구분한다. */
export class PhotoPermissionDeniedError extends Error {
  constructor() {
    super('photo permission denied');
    this.name = 'PhotoPermissionDeniedError';
  }
}

interface SavePostImageParams {
  /** S3 key(`post_image`). 확장자와 새 조회 URL 발급에 쓴다. */
  imageKey: string;
  /** 응답에 같이 온 조회 URL. 없거나 만료됐으면 `imageKey`로 새로 받는다. */
  imageUrl?: string;
}

// iOS는 확장자로 사진·동영상을 구분해서, 확장자가 없으면 저장이 거절된다.
function getExtension(key: string): string {
  const match = /\.(jpe?g|png|heic|webp)$/i.exec(key);
  return match ? match[1].toLowerCase() : 'jpg';
}

async function download(url: string, extension: string): Promise<File> {
  const target = new File(Paths.cache, `post-save-${Date.now()}.${extension}`);
  return File.downloadFileAsync(url, target, { idempotent: true });
}

/**
 * 게시글 사진을 기기 앨범에 저장한다. 읽기 없이 추가만 하는 권한(writeOnly)이라
 * iOS는 "사진 추가" 권한만, Android 13+는 런타임 권한 없이 저장된다.
 */
export async function savePostImage({ imageKey, imageUrl }: SavePostImageParams): Promise<void> {
  const permission = await requestPermissionsAsync(true);
  if (!permission.granted) throw new PhotoPermissionDeniedError();

  const extension = getExtension(imageKey);
  let file: File;
  try {
    if (!imageUrl) throw new Error('no image url');
    file = await download(imageUrl, extension);
  } catch {
    // 상세를 연 지 10분이 지나 presigned URL이 만료됐을 수 있어 한 번 새로 받는다.
    file = await download(await getViewUrl(imageKey), extension);
  }

  try {
    await Asset.create(file.uri);
  } finally {
    try {
      file.delete();
    } catch {
      // 캐시 폴더라 못 지워도 OS가 정리한다.
    }
  }
}
