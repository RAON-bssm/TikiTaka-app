import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** 미리보기에 보이던 영역만 남기도록 가운데를 잘라 낸다. */
export async function cropToPreview(uri: string, previewAspect: number): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  const original = await context.renderAsync();
  const { width, height } = original;
  original.release();

  const cropWidth = Math.min(width, Math.round(height * previewAspect));
  const cropHeight = Math.min(height, Math.round(width / previewAspect));
  context.crop({
    originX: Math.round((width - cropWidth) / 2),
    originY: Math.round((height - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  });
  const cropped = await context.renderAsync();
  const result = await cropped.saveAsync({ compress: 1, format: SaveFormat.JPEG });

  cropped.release();
  context.release();

  return result.uri;
}
