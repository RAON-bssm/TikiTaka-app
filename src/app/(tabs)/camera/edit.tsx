import RotateIcon from '@/assets/icons/rotate-right.svg';
import StraightenDial from '@/components/camera/StraightenDial';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import usePhotoEditor, {
  CROP_RATIOS,
  type CropRatio,
  type Size,
  useInteraction,
} from '@/hooks/camera/usePhotoEditor';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { type LayoutChangeEvent, Pressable, View, type ViewStyle } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const FRAME_MARGIN = 16;
const GRID_LINES = ['33.333%', '66.666%'] as const;
const CORNER_SIZE = 22;
const CORNER_WIDTH = 4;
const CORNER_RADIUS = 6;
const MASK_OPACITY_IDLE = 0.85;
const MASK_OPACITY_ACTIVE = 0.55;
const FRAME_SHADOW = `0px 6px 20px ${palette.gray[800]}33`;

const RATIO_ICON_CLASS: Record<CropRatio['label'], string> = {
  '3:4': 'h-[16px] w-[12px]',
  '1:1': 'h-[14px] w-[14px]',
  '4:3': 'h-[12px] w-[16px]',
  자유: 'h-[14px] w-[14px] border-dashed',
};

const CORNER_OFFSET = -CORNER_WIDTH / 2;
const CORNER_BASE: ViewStyle = {
  position: 'absolute',
  width: CORNER_SIZE,
  height: CORNER_SIZE,
  borderColor: palette.primary[600],
};
const CORNER_STYLES: ViewStyle[] = [
  {
    ...CORNER_BASE,
    top: CORNER_OFFSET,
    left: CORNER_OFFSET,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  {
    ...CORNER_BASE,
    top: CORNER_OFFSET,
    right: CORNER_OFFSET,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: CORNER_RADIUS,
  },
  {
    ...CORNER_BASE,
    bottom: CORNER_OFFSET,
    left: CORNER_OFFSET,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  {
    ...CORNER_BASE,
    bottom: CORNER_OFFSET,
    right: CORNER_OFFSET,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: CORNER_RADIUS,
  },
];

export default function EditPhotoScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [ratio, setRatio] = useState<CropRatio>(CROP_RATIOS[0]);
  const [area, setArea] = useState<Size>();
  const [isExporting, setIsExporting] = useState(false);

  const bounds = area && {
    width: area.width - FRAME_MARGIN * 2,
    height: area.height - FRAME_MARGIN * 2,
  };

  const interaction = useInteraction();
  const editor = usePhotoEditor({
    uri,
    canvas: area,
    area: bounds,
    ratio: ratio.value,
    interaction,
  });

  const areaWidth = area?.width ?? 0;
  const areaHeight = area?.height ?? 0;

  const maskStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      interaction.progress.get(),
      [0, 1],
      [MASK_OPACITY_IDLE, MASK_OPACITY_ACTIVE],
    ),
  }));
  const frameTop = () => {
    'worklet';
    return areaHeight / 2 + editor.frameCY.get() - editor.frameH.get() / 2;
  };
  const frameLeft = () => {
    'worklet';
    return areaWidth / 2 + editor.frameCX.get() - editor.frameW.get() / 2;
  };

  const maskTopStyle = useAnimatedStyle(() => ({ height: frameTop() }));
  const maskBottomStyle = useAnimatedStyle(() => ({
    height: areaHeight - frameTop() - editor.frameH.get(),
  }));
  const maskLeftStyle = useAnimatedStyle(() => ({
    top: frameTop(),
    width: frameLeft(),
    height: editor.frameH.get(),
  }));
  const maskRightStyle = useAnimatedStyle(() => ({
    top: frameTop(),
    width: areaWidth - frameLeft() - editor.frameW.get(),
    height: editor.frameH.get(),
  }));
  const frameStyle = useAnimatedStyle(() => ({
    top: frameTop(),
    left: frameLeft(),
    width: editor.frameW.get(),
    height: editor.frameH.get(),
  }));
  const gridStyle = useAnimatedStyle(() => ({ opacity: interaction.progress.get() }));

  const handleAreaLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea({ width, height });
  };

  const handleNext = async () => {
    if (isExporting || !editor.isReady) return;
    setIsExporting(true);
    try {
      const editedUri = await editor.exportPhoto();
      if (editedUri) {
        router.push({ pathname: '/camera/upload', params: { uri: editedUri } });
      }
    } catch {
      showToast('사진을 편집하지 못했어요. 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex-1 gap-lg px-xl pt-lg" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row items-center justify-between">
          {/* 편집 화면은 촬영 결과를 들고만 있어, 뒤로 가면 사진을 버리고 카메라로 돌아간다. */}
          <BackButton title="사진 편집" />
          <Pressable
            onPress={editor.reset}
            disabled={!editor.isEdited}
            hitSlop={8}
            className="active:opacity-60"
          >
            <Typography
              variant="body2"
              className={editor.isEdited ? 'text-primary-600' : 'text-gray-300'}
            >
              초기화
            </Typography>
          </Pressable>
        </View>

        <GestureDetector gesture={editor.gesture}>
          <View
            className="flex-1 overflow-hidden rounded-lg border border-gray-100 bg-white"
            onLayout={handleAreaLayout}
          >
            {uri && area && editor.baseSize ? (
              <>
                <View className="absolute inset-0 items-center justify-center">
                  <Animated.Image source={{ uri }} style={[editor.baseSize, editor.imageStyle]} />
                </View>

                <View pointerEvents="none" className="absolute inset-0">
                  <Animated.View style={maskStyle} className="absolute inset-0">
                    <Animated.View
                      style={maskTopStyle}
                      className="absolute left-0 right-0 top-0 bg-white"
                    />
                    <Animated.View
                      style={maskBottomStyle}
                      className="absolute bottom-0 left-0 right-0 bg-white"
                    />
                    <Animated.View style={maskLeftStyle} className="absolute left-0 bg-white" />
                    <Animated.View style={maskRightStyle} className="absolute right-0 bg-white" />
                  </Animated.View>

                  <Animated.View
                    style={[frameStyle, { boxShadow: FRAME_SHADOW }]}
                    className="absolute border border-white"
                  >
                    <Animated.View style={gridStyle} className="absolute inset-0">
                      {GRID_LINES.map((line) => (
                        <View
                          key={`v${line}`}
                          className="absolute bottom-0 top-0 border-l border-white/70"
                          style={{ left: line }}
                        />
                      ))}
                      {GRID_LINES.map((line) => (
                        <View
                          key={`h${line}`}
                          className="absolute left-0 right-0 border-t border-white/70"
                          style={{ top: line }}
                        />
                      ))}
                    </Animated.View>
                    {CORNER_STYLES.map((style, index) => (
                      <View key={index} style={style} />
                    ))}
                  </Animated.View>
                </View>
              </>
            ) : editor.loadFailed ? (
              <View className="flex-1 items-center justify-center">
                <Typography variant="body1" className="text-gray-500">
                  사진을 불러올 수 없어요.
                </Typography>
              </View>
            ) : null}
          </View>
        </GestureDetector>

        <View className="gap-xl rounded-lg border border-gray-100 bg-white p-lg">
          <View className="gap-md">
            <Typography variant="h4" className="text-gray-700">
              비율
            </Typography>
            <View className="flex-row items-center gap-sm">
              {CROP_RATIOS.map((option) => {
                const active = option.label === ratio.label;
                return (
                  <Pressable
                    key={option.label}
                    onPress={() => setRatio(option)}
                    className={`flex-1 flex-row items-center justify-center gap-sm rounded-full border py-sm ${
                      active ? 'border-primary-600 bg-primary-600' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <View
                      className={`rounded-xs border-2 ${RATIO_ICON_CLASS[option.label]} ${
                        active ? 'border-white' : 'border-gray-400'
                      }`}
                    />
                    <Typography variant="h4" className={active ? 'text-white' : 'text-gray-500'}>
                      {option.label}
                    </Typography>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={editor.rotate90}
                hitSlop={4}
                accessibilityLabel="90도 회전"
                className="h-[36px] w-[36px] items-center justify-center rounded-full bg-primary-100 active:opacity-60"
              >
                <RotateIcon width={20} height={20} color={palette.primary[600]} />
              </Pressable>
            </View>
          </View>

          <StraightenDial tilt={editor.tilt} interaction={interaction} />
        </View>

        <Button
          content={isExporting ? '처리 중...' : '다음'}
          onclick={() => void handleNext()}
          className={isExporting || !editor.isReady ? 'opacity-50' : ''}
        />
      </View>
    </SafeAreaView>
  );
}
