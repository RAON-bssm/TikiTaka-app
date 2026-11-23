import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { hasSeenPermissionNotice, markPermissionNoticeSeen } from '@/api/permissionNotice';
import {
  hasAskedNotificationPermission,
  markNotificationPermissionAsked,
  requestNotificationPermission,
} from '@/api/pushNotification';
import LogoIcon from '@/assets/images/splash/logo.svg';
import RingIcon from '@/assets/images/splash/ring.svg';
import StarIcon from '@/assets/images/splash/star.svg';
import AppUpdateDialog from '@/components/appVersion/AppUpdateDialog';
import PermissionNoticeDialog, {
  type NoticePermission,
} from '@/components/permission/PermissionNoticeDialog';
import WageDialog from '@/components/territory/WageDialog';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import { useAppVersionCheck } from '@/hooks/appVersion/useAppVersionCheck';
import { useAuthStatus } from '@/hooks/auth/useAuthStatus';
import { useForegroundPushToast } from '@/hooks/pushNotification/useForegroundPushToast';
import { useOpenedPushType } from '@/hooks/pushNotification/useOpenedPushType';

const GRADIENT_COLORS = [
  palette.primary[600],
  palette.primary[600],
  palette.secondary[100],
] as const;
const GRADIENT_LOCATIONS = [0, 0.5, 1] as const;

// 토큰 확인은 대개 순식간이라, 최소 시간이 없으면 스플래시가 깜빡이고 사라진다.
// 등장 모션(1.5초)이 끝까지 보이는 길이이기도 하다.
const MIN_VISIBLE_MS = 1500;

const EASE_IN_OUT = Easing.bezier(0.5, 0, 0.5, 1);
const EASE_BACK = Easing.bezier(0.7, -0.4, 0.4, 1.4);
const EASE_POP = Easing.bezier(0.45, 1.45, 0.8, 1);

const RING_RISE_PX = 149;
const RING_ENTER_MS = 600;
const STAR_RISE_PX = 100;
const STAR_DELAY_MS = 200;
const STAR_ENTER_MS = 600;
const LOGO_FADE_MS = 640;
// 같은 폭으로 계속 흔들면 기계적으로 보여서, 처음에 크게 튕기고 점점 잦아들게 했다(감쇠 진동).
// 반주기를 일정하게 둬야 진자처럼 자연스럽다. 첫 구간은 정지 상태에서 출발하므로 절반 길이로 잡는다.
const LOGO_WIGGLE_PEAKS_DEG = [-6, 4.5, -3, 1.8, -0.8, 0];
const LOGO_WIGGLE_HALF_PERIOD_MS = 200;
const CHAR_STAGGER_MS = 50;
const CHAR_POP_MS = 500;

const TAGLINE = '여러분들의 동네 리그에 참여해보세요!';
let taglineOrder = 0;
const TAGLINE_CHARS = Array.from(TAGLINE, (char) => ({
  char,
  order: char === ' ' ? null : taglineOrder++,
}));

const PopChar = ({ char, order }: { char: string; order: number }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      order * CHAR_STAGGER_MS,
      withTiming(1, { duration: CHAR_POP_MS, easing: EASE_POP }),
    );
  }, [progress, order]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Animated.View style={style}>
      <Typography variant="h3" className="text-white">
        {char}
      </Typography>
    </Animated.View>
  );
};

/**
 * 네이티브 스플래시는 그라디언트·배치를 못 그려서, 같은 배경색의 네이티브 스플래시 위에 이어 띄운다.
 * 로그인 판정과 첫 화면 이동이 이 뒤에서 끝나므로 화면이 튀는 게 보이지 않는다.
 */
export default function AppSplash() {
  const status = useAuthStatus();
  const [isMinTimeElapsed, setIsMinTimeElapsed] = useState(false);
  // null = 아직 확인 중. 확인 전에 스플래시를 걷으면 앱 화면이 잠깐 보인 뒤 안내가 떠서, 결과가 나올 때까지 덮어 둔다.
  const [showPermissionNotice, setShowPermissionNotice] = useState<boolean | null>(null);
  // 닫히는 애니메이션 동안에도 내용이 남아 있어야 해서 표시 여부와 따로 둔다.
  const [noticePermissions, setNoticePermissions] = useState<NoticePermission[]>([]);
  const { data: versionCheck } = useAppVersionCheck();
  // 앱이 꺼진 상태에서 알림으로 열린 경우를 놓치지 않도록 스플래시 때부터 구독한다.
  const { openedType: openedPushType, clear: clearOpenedPushType } = useOpenedPushType();
  useForegroundPushToast();

  // 로그아웃 상태에서 알림으로 열렸으면 팝업을 버린다. 남겨 두면 나중에 (다른 계정일 수도 있는) 로그인 직후 갑자기 뜬다.
  useEffect(() => {
    if (status === 'unauthenticated' && openedPushType) clearOpenedPushType();
  }, [status, openedPushType, clearOpenedPushType]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMinTimeElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Promise.all([hasSeenPermissionNotice(), hasAskedNotificationPermission()])
      .then(([seen, askedNotification]) => {
        const permissions: NoticePermission[] = [];
        if (!seen) permissions.push('camera');
        if (!askedNotification) permissions.push('notification');
        setNoticePermissions(permissions);
        setShowPermissionNotice(permissions.length > 0);
      })
      .catch(() => {
        setNoticePermissions(['camera', 'notification']);
        setShowPermissionNotice(true);
      });
  }, []);

  const ringOpacity = useSharedValue(0);
  const ringY = useSharedValue(RING_RISE_PX);
  const starOpacity = useSharedValue(0);
  const starY = useSharedValue(STAR_RISE_PX);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(0);

  useEffect(() => {
    ringOpacity.value = withTiming(1, { duration: RING_ENTER_MS, easing: EASE_IN_OUT });
    ringY.value = withTiming(0, { duration: RING_ENTER_MS, easing: EASE_BACK });

    const starEnter = { duration: STAR_ENTER_MS, easing: EASE_BACK };
    starOpacity.value = withDelay(STAR_DELAY_MS, withTiming(1, starEnter));
    starY.value = withDelay(STAR_DELAY_MS, withTiming(0, starEnter));

    logoOpacity.value = withTiming(1, { duration: LOGO_FADE_MS, easing: EASE_BACK });
    const lastPeak = LOGO_WIGGLE_PEAKS_DEG.length - 1;
    const swings = LOGO_WIGGLE_PEAKS_DEG.map((deg, i) =>
      withTiming(deg, {
        duration: i === 0 ? LOGO_WIGGLE_HALF_PERIOD_MS / 2 : LOGO_WIGGLE_HALF_PERIOD_MS,
        easing: i === 0 || i === lastPeak ? Easing.out(Easing.sin) : EASE_IN_OUT,
      }),
    );
    logoRotate.value = withSequence(...swings);
  }, [ringOpacity, ringY, starOpacity, starY, logoOpacity, logoRotate]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ translateY: ringY.value }],
  }));
  const starStyle = useAnimatedStyle(() => ({
    opacity: starOpacity.value,
    transform: [{ translateY: starY.value }],
  }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ rotate: `${logoRotate.value}deg` }],
  }));

  const handleConfirmPermissionNotice = () => {
    setShowPermissionNotice(false);
    markPermissionNoticeSeen().catch(() => {});
    if (noticePermissions.includes('notification')) {
      markNotificationPermissionAsked().catch(() => {});
      // 거절해도 앱은 그대로 쓴다. 다시 켜는 건 기기 설정에서 한다.
      requestNotificationPermission().catch(() => {});
    }
  };

  if (status !== 'loading' && isMinTimeElapsed && showPermissionNotice !== null) {
    const showWage =
      openedPushType === 'WAGE' && status === 'authenticated' && !showPermissionNotice;
    return (
      <>
        <PermissionNoticeDialog
          visible={showPermissionNotice}
          permissions={noticePermissions}
          onConfirm={handleConfirmPermissionNotice}
        />
        {/* iOS는 모달을 하나만 띄워서 일급 팝업을 먼저 보여 주고, 닫으면 업데이트 안내를 띄운다. */}
        <AppUpdateDialog versionCheck={versionCheck} enabled={!showPermissionNotice && !showWage} />
        <WageDialog visible={showWage} onClose={clearOpenedPushType} />
      </>
    );
  }

  return (
    <Animated.View
      exiting={FadeOutUp.duration(400).easing(Easing.in(Easing.quad))}
      style={StyleSheet.absoluteFill}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={GRADIENT_COLORS}
        locations={GRADIENT_LOCATIONS}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View className="absolute" style={[{ top: '8.8%', left: '-7.2%' }, ringStyle]}>
        <RingIcon width={189} height={198.934} />
      </Animated.View>

      <Animated.View
        className="absolute items-center justify-center"
        style={[{ right: -72, bottom: 0, width: 254, height: 281 }, starStyle]}
      >
        <View style={{ transform: [{ rotate: '-24.2deg' }] }}>
          <StarIcon width={186.203} height={220.32} />
        </View>
      </Animated.View>

      <View className="absolute inset-x-0 items-center gap-xl px-xl" style={{ top: '28%' }}>
        <Animated.View style={logoStyle}>
          <LogoIcon width={250} height={52} />
        </Animated.View>
        <View
          className="max-w-full flex-row flex-wrap justify-center"
          accessible
          accessibilityLabel={TAGLINE}
        >
          {TAGLINE_CHARS.map(({ char, order }, i) =>
            order === null ? (
              <Typography key={i} variant="h3">
                {char}
              </Typography>
            ) : (
              <PopChar key={i} char={char} order={order} />
            ),
          )}
        </View>
      </View>
    </Animated.View>
  );
}
