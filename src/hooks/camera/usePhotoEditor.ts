import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const CROP_RATIOS = [
  { label: '3:4', value: 3 / 4 },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
] as const;

export type CropRatio = (typeof CROP_RATIOS)[number];

export interface Size {
  width: number;
  height: number;
}

export const MAX_TILT = 45;
const MAX_ZOOM = 5;
const ANIMATION_MS = 250;

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const toRadians = (degrees: number) => {
  'worklet';
  return (degrees * Math.PI) / 180;
};

const coverScale = (frame: Size, image: Size, radians: number) => {
  'worklet';
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  return Math.max(
    (frame.width * cos + frame.height * sin) / image.width,
    (frame.width * sin + frame.height * cos) / image.height,
  );
};

export function useInteraction() {
  const count = useSharedValue(0);
  const progress = useSharedValue(0);

  const begin = () => {
    'worklet';
    count.set(count.get() + 1);
    progress.set(withTiming(1, { duration: 150 }));
  };

  const end = () => {
    'worklet';
    count.set(Math.max(0, count.get() - 1));
    if (count.get() === 0) progress.set(withTiming(0, { duration: 400 }));
  };

  return { progress, begin, end };
}

export type Interaction = ReturnType<typeof useInteraction>;

/**
 * 원본 이미지를 프레임에 맞춰 돌리고·키우고·옮기는 편집 상태.
 *
 * 위치는 "프레임 중심이 원본 이미지의 어디에 있는지"(offset, 이미지 중심 기준 이미지 px)로 저장한다.
 * 이 좌표계에서는 프레임이 이미지 밖으로 나가지 않는 범위가 축마다 독립된 사각형이라 clamp가 정확하고,
 * 내보낼 때도 같은 값으로 자를 위치를 바로 계산할 수 있다.
 */
export default function usePhotoEditor({
  uri,
  area,
  frame,
  interaction,
}: {
  uri: string | undefined;
  area: Size | undefined;
  frame: Size | undefined;
  interaction: Interaction;
}) {
  const [imageSize, setImageSize] = useState<Size & { uri: string }>();
  const [isEdited, setIsEdited] = useState(false);

  const imageW = useSharedValue(0);
  const imageH = useSharedValue(0);
  const frameW = useSharedValue(0);
  const frameH = useSharedValue(0);
  const quarterTarget = useSharedValue(0);
  const rotation = useSharedValue(0);
  const tilt = useSharedValue(0);
  const zoom = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  useEffect(() => {
    if (!uri) return;
    let active = true;
    Image.getSize(uri, (width, height) => {
      if (active && width && height) setImageSize({ uri, width, height });
    });
    return () => {
      active = false;
    };
  }, [uri]);

  const image = imageSize && imageSize.uri === uri ? imageSize : undefined;

  useEffect(() => {
    imageW.set(image?.width ?? 0);
    imageH.set(image?.height ?? 0);
  }, [image?.width, image?.height, imageW, imageH]);

  const frameWidth = frame?.width;
  const frameHeight = frame?.height;
  useEffect(() => {
    if (!frameWidth || !frameHeight) return;
    const animate = frameW.get() > 0;
    frameW.set(animate ? withTiming(frameWidth, { duration: ANIMATION_MS }) : frameWidth);
    frameH.set(animate ? withTiming(frameHeight, { duration: ANIMATION_MS }) : frameHeight);
  }, [frameWidth, frameHeight, frameW, frameH]);

  const angle = () => {
    'worklet';
    return toRadians(rotation.get() + tilt.get());
  };

  const currentScale = () => {
    'worklet';
    const cover = coverScale(
      { width: frameW.get(), height: frameH.get() },
      { width: imageW.get(), height: imageH.get() },
      angle(),
    );
    return cover * zoom.get();
  };

  const clampOffset = () => {
    'worklet';
    if (!imageW.get() || !frameW.get()) return;
    const cos = Math.abs(Math.cos(angle()));
    const sin = Math.abs(Math.sin(angle()));
    const scale = currentScale();
    const limitX = Math.max(
      0,
      imageW.get() / 2 - (frameW.get() * cos + frameH.get() * sin) / (2 * scale),
    );
    const limitY = Math.max(
      0,
      imageH.get() / 2 - (frameW.get() * sin + frameH.get() * cos) / (2 * scale),
    );
    offsetX.set(clamp(offsetX.get(), -limitX, limitX));
    offsetY.set(clamp(offsetY.get(), -limitY, limitY));
  };

  useAnimatedReaction(
    () => [rotation.get(), tilt.get(), zoom.get(), frameW.get(), frameH.get(), imageW.get()],
    () => clampOffset(),
  );

  useAnimatedReaction(
    () =>
      quarterTarget.get() % 4 !== 0 ||
      Math.abs(tilt.get()) >= 0.5 ||
      zoom.get() > 1.01 ||
      Math.abs(offsetX.get()) > 1 ||
      Math.abs(offsetY.get()) > 1,
    (current, previous) => {
      if (current !== previous) runOnJS(setIsEdited)(current);
    },
  );

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onBegin(interaction.begin)
    .onFinalize(interaction.end)
    .onChange((event) => {
      // 화면에서 손가락이 움직인 만큼 이미지가 따라오도록, 화면 이동량을 이미지 좌표로 되돌린다.
      const cos = Math.cos(angle());
      const sin = Math.sin(angle());
      const scale = currentScale();
      offsetX.set(offsetX.get() - (cos * event.changeX + sin * event.changeY) / scale);
      offsetY.set(offsetY.get() - (-sin * event.changeX + cos * event.changeY) / scale);
      clampOffset();
    });

  const pinch = Gesture.Pinch()
    .onBegin(interaction.begin)
    .onFinalize(interaction.end)
    .onChange((event) => {
      zoom.set(clamp(zoom.get() * event.scaleChange, 1, MAX_ZOOM));
    });

  const twoFingerRotation = Gesture.Rotation()
    .onBegin(interaction.begin)
    .onFinalize(interaction.end)
    .onChange((event) => {
      tilt.set(clamp(tilt.get() + (event.rotationChange * 180) / Math.PI, -MAX_TILT, MAX_TILT));
    });

  const gesture = Gesture.Simultaneous(pan, pinch, twoFingerRotation);

  const baseScale = image && area ? coverScale(area, image, 0) : 0;
  const baseSize = image
    ? { width: image.width * baseScale, height: image.height * baseScale }
    : undefined;

  const imageStyle = useAnimatedStyle(() => {
    if (!baseScale || !imageW.get()) return { opacity: 0 };
    const radians = angle();
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const scale = currentScale();
    return {
      opacity: 1,
      transform: [
        { translateX: -scale * (cos * offsetX.get() - sin * offsetY.get()) },
        { translateY: -scale * (sin * offsetX.get() + cos * offsetY.get()) },
        { rotate: `${radians}rad` },
        { scale: scale / baseScale },
      ],
    };
  });

  const rotate90 = () => {
    quarterTarget.set(quarterTarget.get() + 1);
    rotation.set(withTiming(quarterTarget.get() * 90, { duration: ANIMATION_MS }));
  };

  const reset = () => {
    const timing = { duration: ANIMATION_MS };
    const nearestTurn = Math.round(quarterTarget.get() / 4) * 4;
    quarterTarget.set(nearestTurn);
    rotation.set(withTiming(nearestTurn * 90, timing));
    tilt.set(withTiming(0, timing));
    zoom.set(withTiming(1, timing));
    offsetX.set(withTiming(0, timing));
    offsetY.set(withTiming(0, timing));
  };

  const exportPhoto = async (): Promise<string | undefined> => {
    if (!uri || !image || !frame) return undefined;

    const degrees = (((quarterTarget.get() * 90 + tilt.get()) % 360) + 360) % 360;
    const radians = toRadians(degrees);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const cover = coverScale(frame, image, radians);
    const scale = cover * zoom.get();

    const context = ImageManipulator.manipulate(uri);
    if (degrees !== 0) context.rotate(degrees);
    const rotated = await context.renderAsync();
    const canvas = { width: rotated.width, height: rotated.height };
    rotated.release();

    const cropWidth = Math.min(canvas.width, Math.round(frame.width / scale));
    const cropHeight = Math.min(canvas.height, Math.round(frame.height / scale));
    const centerX = canvas.width / 2 + cos * offsetX.get() - sin * offsetY.get();
    const centerY = canvas.height / 2 + sin * offsetX.get() + cos * offsetY.get();
    context.crop({
      originX: clamp(Math.round(centerX - cropWidth / 2), 0, canvas.width - cropWidth),
      originY: clamp(Math.round(centerY - cropHeight / 2), 0, canvas.height - cropHeight),
      width: cropWidth,
      height: cropHeight,
    });

    const cropped = await context.renderAsync();
    const result = await cropped.saveAsync({ compress: 1, format: SaveFormat.JPEG });
    cropped.release();
    context.release();

    return result.uri;
  };

  return {
    isReady: !!image && !!frame,
    isEdited,
    baseSize,
    imageStyle,
    gesture,
    tilt,
    frameW,
    frameH,
    rotate90,
    reset,
    exportPhoto,
  };
}
