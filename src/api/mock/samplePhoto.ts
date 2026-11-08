import { Asset } from 'expo-asset';

/** 개발용 목 모드에서 카메라가 없는 시뮬레이터 대신 쓰는 사진 */
const SAMPLE_PHOTO = require('@/assets/images/topic-bg.webp');

export async function loadSamplePhoto(): Promise<string> {
  const [asset] = await Asset.loadAsync(SAMPLE_PHOTO);
  // 업로드 전 압축(ImageManipulator)이 로컬 파일을 읽으므로 내려받은 경로를 쓴다.
  return asset.localUri ?? asset.uri;
}
