import { ImageManipulator, SaveFormat, type ImageRef } from 'expo-image-manipulator';

export async function cropToPreview(uri: string, previewAspect: number): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  let cropped: ImageRef | undefined;

  try {
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
    cropped = await context.renderAsync();
    const result = await cropped.saveAsync({ compress: 1, format: SaveFormat.JPEG });
    return result.uri;
  } finally {
    cropped?.release();
    context.release();
  }
}
