import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import GuideBubble from '@/components/tutorial/GuideBubble';
import GuideCharacter from '@/components/tutorial/GuideCharacter';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { MISSION_MESSAGES, type TutorialStep } from '@/constants/tutorial';
import { guardedNavigate } from '@/hooks/navigation/useLeaveGuard';
import { useMyBoard } from '@/hooks/post/useMyBoard';
import { useTutorial } from '@/hooks/tutorial/useTutorial';

type Rect = { x: number; y: number; width: number; height: number };

const HOLE_PADDING = 4;
// 흰 테두리(rounded-lg = 16)와 같은 반경으로 뚫는다.
const HOLE_RADIUS = 16;
// bg-black/60과 같은 농도. 구멍 뚫린 덮개는 SVG라 클래스 대신 값으로 맞춘다.
const DIM_OPACITY = 0.6;
const GUIDE_GAP = 12;
// 카메라 화면 상단의 주제 제목·뒤로 가기 버튼 아래에 오도록 띄운다.
const MISSION_GUIDE_TOP = 48;

/** 탭 레이아웃 위에 덮는다. Modal을 쓰면 아래 화면 터치가 모두 막혀 카메라 촬영 단계를 진행할 수 없다. */
export default function TutorialOverlay() {
  const { step } = useTutorial();
  if (!step) return null;
  if (step.kind === 'mission') return <MissionGuide fallbackMessage={step.message} />;
  // 단계마다 측정 상태를 새로 시작해야 이전 아이콘 위치가 잠깐 남지 않는다.
  return <SpotlightGuide key={step.id} step={step} />;
}

const SpotlightGuide = ({ step }: { step: TutorialStep }) => {
  const { next, goTo, getTarget } = useTutorial();
  const { data: myBoard } = useMyBoard();
  const overlayRef = useRef<View>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // null = 측정 중, 'none' = 대상이 화면에 없어 가운데에 띄운다.
  const [hole, setHole] = useState<Rect | 'none' | null>(step.target ? null : 'none');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const target = step.target;
    if (!target) return;
    let cancelled = false;
    // 탭 이동 직후에는 레이아웃이 끝나지 않아 좌표가 어긋날 수 있어 다음 프레임에 잰다.
    const frame = requestAnimationFrame(() => {
      const node = getTarget(target);
      const overlay = overlayRef.current;
      if (!node || !overlay) {
        setHole('none');
        return;
      }
      // 둘 다 창 기준으로 재서 빼야 상태바·edge-to-edge 차이가 플랫폼과 무관하게 상쇄된다.
      overlay.measureInWindow((ox, oy) => {
        node.measureInWindow((x, y, width, h) => {
          if (cancelled) return;
          if (!width || !h) {
            setHole('none');
            return;
          }
          setHole({
            x: x - ox - HOLE_PADDING,
            y: y - oy - HOLE_PADDING,
            width: width + HOLE_PADDING * 2,
            height: h + HOLE_PADDING * 2,
          });
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [step.target, getTarget]);

  // 데이터를 못 받은 경우(undefined)는 매치가 있다고 보고 진행한다. 업로드 화면이 다시 확인한다.
  const isCamera = step.kind === 'camera';
  const hasNoMatch = isCamera && myBoard === null;
  const canShoot = isCamera && !hasNoMatch;
  const message = hasNoMatch ? (step.noMatchMessage ?? step.message) : step.message;

  const handlePrimary = () => {
    if (canShoot) {
      guardedNavigate(() => {
        router.navigate('/camera');
        goTo('mission');
      });
      return;
    }
    if (hasNoMatch) {
      goTo('map');
      return;
    }
    next();
  };

  const rect = hole && hole !== 'none' ? hole : null;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
      <View
        ref={overlayRef}
        style={StyleSheet.absoluteFill}
        onLayout={(e) => setSize(e.nativeEvent.layout)}
      >
        {rect ? (
          <>
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <Svg width={size.width} height={size.height}>
                <Path
                  d={`M0 0H${size.width}V${size.height}H0Z ${roundedRectPath(rect, HOLE_RADIUS)}`}
                  fill="black"
                  fillOpacity={DIM_OPACITY}
                  fillRule="evenodd"
                />
              </Svg>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handlePrimary}
              className="absolute rounded-lg border-2 border-white"
              style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
            />
          </>
        ) : (
          <View className="absolute inset-0 bg-black/60" />
        )}

        {hole !== null && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            className="absolute inset-x-0 px-xl"
            style={
              rect
                ? { bottom: size.height - rect.y + GUIDE_GAP }
                : { top: 0, bottom: 0, justifyContent: 'center' }
            }
          >
            <GuideBubble message={message}>
              {canShoot && (
                <Pressable onPress={() => goTo('map')} hitSlop={8} className="active:opacity-70">
                  <Typography variant="body3" className="text-gray-500 underline">
                    나중에 할게요
                  </Typography>
                </Pressable>
              )}
              <Button
                size="sm"
                content={hasNoMatch ? '다음' : (step.cta ?? '다음')}
                onclick={handlePrimary}
              />
            </GuideBubble>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

/** 덮개 전체 경로와 evenodd로 겹쳐 이 영역만 비운다. */
function roundedRectPath({ x, y, width: w, height: h }: Rect, r: number) {
  return (
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}` +
    `V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  );
}

const MissionGuide = ({ fallbackMessage }: { fallbackMessage: string }) => {
  const { goTo } = useTutorial();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const message = MISSION_MESSAGES[pathname] ?? fallbackMessage;

  const handleLater = () => {
    // 편집·업로드 화면에 있으면 카메라 스택을 비워야 다음에 카메라를 열 때 촬영 화면부터 나온다.
    if (pathname.startsWith('/camera') && router.canDismiss()) router.dismissAll();
    router.navigate('/');
    goTo('map');
  };

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View
        entering={FadeInDown.duration(300)}
        className="absolute inset-x-0 flex-row items-end gap-sm px-lg"
        style={{ top: insets.top + MISSION_GUIDE_TOP }}
      >
        <GuideCharacter size={64} />
        <View className="flex-1 gap-sm rounded-lg bg-white p-md">
          <Typography variant="body3" className="text-gray-800">
            {message}
          </Typography>
          <Pressable onPress={handleLater} hitSlop={8} className="self-end active:opacity-70">
            <Typography variant="caption" className="text-gray-500 underline">
              나중에 할게요
            </Typography>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};
