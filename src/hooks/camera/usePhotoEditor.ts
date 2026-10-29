import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/** 첫 항목이 기본값이다. */
export const CROP_RATIOS = [
  // 모서리로 가로·세로를 따로 조절한다. 처음에는 사진 원본 비율로 시작한다.
  { label: '자유', value: null },
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
const MIN_FRAME_SIDE = 80;
const SETTLE_DELAY_MS = 600;

// 꺾쇠는 4px로 얇아, 모서리에서 이 거리 안에서 시작한 터치를 모서리 드래그로 본다.
const CORNER_HIT_RADIUS = 32;

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

const fitFrame = (bounds: Size, aspect: number): Size => {
  'worklet';
  return bounds.width / bounds.height > aspect
    ? { width: bounds.height * aspect, height: bounds.height }
    : { width: bounds.width, height: bounds.width / aspect };
};

// worklet 안의 화살표 함수는 React Compiler가 밖으로 끌어올려(_temp) worklet이 아니게 되므로 모듈에 둔다.
const settleTo = (value: number) => {
  'worklet';
  return withDelay(SETTLE_DELAY_MS, withTiming(value, { duration: ANIMATION_MS }));
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
  canvas,
  area,
  ratio,
  interaction,
}: {
  uri: string | undefined;
  canvas: Size | undefined;
  area: Size | undefined;
  /** null이면 자유 비율. */
  ratio: number | null;
  interaction: Interaction;
}) {
  const [imageSize, setImageSize] = useState<Size & { uri: string }>();
  const [isEdited, setIsEdited] = useState(false);

  const imageW = useSharedValue(0);
  const imageH = useSharedValue(0);
  const frameW = useSharedValue(0);
  const frameH = useSharedValue(0);
  const frameCX = useSharedValue(0);
  const frameCY = useSharedValue(0);
  const fullW = useSharedValue(0);
  const fullH = useSharedValue(0);
  const boundsW = useSharedValue(0);
  const boundsH = useSharedValue(0);
  const canvasW = useSharedValue(0);
  const canvasH = useSharedValue(0);
  const isFree = useSharedValue(false);
  const drag = useSharedValue({
    active: false,
    free: false,
    directionX: 1,
    directionY: 1,
    width: 0,
    height: 0,
    anchorX: 0,
    anchorY: 0,
    imageX: 0,
    imageY: 0,
    scale: 1,
    zoom: 1,
  });
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

  const aspect = ratio ?? (image ? image.width / image.height : undefined);
  const frame = area && aspect ? fitFrame(area, aspect) : undefined;

  useEffect(() => {
    isFree.set(ratio === null);
  }, [ratio, isFree]);

  const frameWidth = frame?.width;
  const frameHeight = frame?.height;
  useEffect(() => {
    if (!frameWidth || !frameHeight) return;
    fullW.set(frameWidth);
    fullH.set(frameHeight);
    const animate = frameW.get() > 0;
    frameW.set(animate ? withTiming(frameWidth, { duration: ANIMATION_MS }) : frameWidth);
    frameH.set(animate ? withTiming(frameHeight, { duration: ANIMATION_MS }) : frameHeight);
    frameCX.set(withTiming(0, { duration: ANIMATION_MS }));
    frameCY.set(withTiming(0, { duration: ANIMATION_MS }));
  }, [frameWidth, frameHeight, frameW, frameH, fullW, fullH, frameCX, frameCY]);

  useEffect(() => {
    boundsW.set(area?.width ?? 0);
    boundsH.set(area?.height ?? 0);
  }, [area?.width, area?.height, boundsW, boundsH]);

  useEffect(() => {
    canvasW.set(canvas?.width ?? 0);
    canvasH.set(canvas?.height ?? 0);
  }, [canvas?.width, canvas?.height, canvasW, canvasH]);

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
      Math.abs(offsetY.get()) > 1 ||
      (fullH.get() > 0 &&
        frameH.get() > 0 &&
        Math.abs(frameW.get() / frameH.get() - fullW.get() / fullH.get()) > 0.01),
    (current, previous) => {
      if (current !== previous) runOnJS(setIsEdited)(current);
    },
  );

  /**
   * 반대쪽 모서리를 고정하고 비율을 유지한 채 프레임을 줄이거나 늘린다. 끄는 동안 사진은 화면에서 제자리에 둔다.
   * 손을 떼면 잠시 뒤 프레임을 다시 가득 채우는데, 비율이 같아 확대 배율(zoom)을 그대로 두면
   * 사진도 같은 비율로 커져 고른 영역이 그대로 확대된다.
   */
  const beginCornerDrag = (directionX: number, directionY: number) => {
    'worklet';
    const width = frameW.get();
    const height = frameH.get();
    const scale = currentScale();
    const cos = Math.cos(angle());
    const sin = Math.sin(angle());
    drag.set({
      active: true,
      free: isFree.get(),
      directionX,
      directionY,
      width,
      height,
      anchorX: frameCX.get() - (directionX * width) / 2,
      anchorY: frameCY.get() - (directionY * height) / 2,
      imageX: frameCX.get() - scale * (cos * offsetX.get() - sin * offsetY.get()),
      imageY: frameCY.get() - scale * (sin * offsetX.get() + cos * offsetY.get()),
      scale,
      zoom: zoom.get(),
    });
  };

  const updateCornerDrag = (translationX: number, translationY: number) => {
    'worklet';
    const start = drag.get();
    const roomX = boundsW.get() / 2 - start.directionX * start.anchorX;
    const roomY = boundsH.get() / 2 - start.directionY * start.anchorY;
    let width: number;
    let height: number;
    if (start.free) {
      width = clamp(start.width + start.directionX * translationX, MIN_FRAME_SIDE, roomX);
      height = clamp(start.height + start.directionY * translationY, MIN_FRAME_SIDE, roomY);
    } else {
      const ratio = start.width / start.height;
      const maxWidth = Math.min(roomX, roomY * ratio, start.width * start.zoom);
      // 너무 작게 줄이면 다시 펼칠 때 MAX_ZOOM을 넘어, 그만큼은 못 줄이게 한다.
      const minWidth = Math.max(
        ratio >= 1 ? MIN_FRAME_SIDE * ratio : MIN_FRAME_SIDE,
        (start.width * start.zoom) / MAX_ZOOM,
      );
      width = clamp(
        Math.max(
          start.width + start.directionX * translationX,
          (start.height + start.directionY * translationY) * ratio,
        ),
        Math.min(minWidth, maxWidth),
        maxWidth,
      );
      height = width / ratio;
    }
    const centerX = start.anchorX + (start.directionX * width) / 2;
    const centerY = start.anchorY + (start.directionY * height) / 2;

    frameW.set(width);
    frameH.set(height);
    frameCX.set(centerX);
    frameCY.set(centerY);
    // 사진의 화면 배율을 끌기 시작할 때 그대로 두려면 zoom = 시작 배율 / 새 프레임을 덮는 최소 배율.
    // 자유 비율에서 사진보다 크게 늘리면 1 아래로 내려가므로, 그때는 사진이 같이 커진다.
    const cover = coverScale(
      { width, height },
      { width: imageW.get(), height: imageH.get() },
      angle(),
    );
    zoom.set(Math.max(1, start.scale / cover));

    const cos = Math.cos(angle());
    const sin = Math.sin(angle());
    const dx = centerX - start.imageX;
    const dy = centerY - start.imageY;
    offsetX.set((cos * dx + sin * dy) / start.scale);
    offsetY.set((-sin * dx + cos * dy) / start.scale);
    clampOffset();
  };

  const endCornerDrag = () => {
    'worklet';
    drag.set({ ...drag.get(), active: false });
    const settled = fitFrame(
      { width: boundsW.get(), height: boundsH.get() },
      frameW.get() / frameH.get(),
    );
    frameW.set(settleTo(settled.width));
    frameH.set(settleTo(settled.height));
    frameCX.set(settleTo(0));
    frameCY.set(settleTo(0));
  };

  // 모서리용 제스처를 따로 겹쳐 두면 바깥 사진 이동 제스처가 터치를 먼저 가져가 모서리가 움직이지 않았다.
  // 그래서 제스처는 하나로 두고, 터치가 모서리 근처에서 시작됐는지로 크기 조절과 사진 이동을 나눈다.
  const pan = Gesture.Pan()
    .averageTouches(true)
    .onBegin((event) => {
      interaction.begin();
      const left = canvasW.get() / 2 + frameCX.get() - frameW.get() / 2;
      const top = canvasH.get() / 2 + frameCY.get() - frameH.get() / 2;
      const nearLeft = Math.abs(event.x - left) <= CORNER_HIT_RADIUS;
      const nearRight = Math.abs(event.x - (left + frameW.get())) <= CORNER_HIT_RADIUS;
      const nearTop = Math.abs(event.y - top) <= CORNER_HIT_RADIUS;
      const nearBottom = Math.abs(event.y - (top + frameH.get())) <= CORNER_HIT_RADIUS;
      if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
        beginCornerDrag(nearRight ? 1 : -1, nearBottom ? 1 : -1);
      }
    })
    .onChange((event) => {
      if (drag.get().active) {
        updateCornerDrag(event.translationX, event.translationY);
        return;
      }
      // 화면에서 손가락이 움직인 만큼 이미지가 따라오도록, 화면 이동량을 이미지 좌표로 되돌린다.
      const cos = Math.cos(angle());
      const sin = Math.sin(angle());
      const scale = currentScale();
      offsetX.set(offsetX.get() - (cos * event.changeX + sin * event.changeY) / scale);
      offsetY.set(offsetY.get() - (-sin * event.changeX + cos * event.changeY) / scale);
      clampOffset();
    })
    .onFinalize(() => {
      if (drag.get().active) endCornerDrag();
      interaction.end();
    });

  const pinch = Gesture.Pinch()
    .onBegin(interaction.begin)
    .onFinalize(interaction.end)
    .onChange((event) => {
      if (drag.get().active) return;
      // 모서리로 작게 잘라 MAX_ZOOM을 넘은 상태라면 그 배율에서 갑자기 줄어들지 않게 한다.
      zoom.set(clamp(zoom.get() * event.scaleChange, 1, Math.max(MAX_ZOOM, zoom.get())));
    });

  const twoFingerRotation = Gesture.Rotation()
    .onBegin(interaction.begin)
    .onFinalize(interaction.end)
    .onChange((event) => {
      if (drag.get().active) return;
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
        { translateX: frameCX.get() - scale * (cos * offsetX.get() - sin * offsetY.get()) },
        { translateY: frameCY.get() - scale * (sin * offsetX.get() + cos * offsetY.get()) },
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
    frameW.set(withTiming(fullW.get(), timing));
    frameH.set(withTiming(fullH.get(), timing));
    frameCX.set(withTiming(0, timing));
    frameCY.set(withTiming(0, timing));
  };

  const exportPhoto = async (): Promise<string | undefined> => {
    if (!uri || !image || !frame) return undefined;
    // 모서리를 놓은 직후라 프레임이 아직 원래 크기로 돌아가는 중일 수 있어, 화면에 보이는 현재 크기로 자른다.
    const frameSize = { width: frameW.get(), height: frameH.get() };

    const degrees = (((quarterTarget.get() * 90 + tilt.get()) % 360) + 360) % 360;
    const radians = toRadians(degrees);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const cover = coverScale(frameSize, image, radians);
    const scale = cover * zoom.get();

    const context = ImageManipulator.manipulate(uri);
    if (degrees !== 0) context.rotate(degrees);
    const rotated = await context.renderAsync();
    const canvas = { width: rotated.width, height: rotated.height };
    rotated.release();

    const cropWidth = Math.min(canvas.width, Math.round(frameSize.width / scale));
    const cropHeight = Math.min(canvas.height, Math.round(frameSize.height / scale));
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
    frameCX,
    frameCY,
    rotate90,
    reset,
    exportPhoto,
  };
}
