import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface Props {
  /** 원의 지름(px) */
  size: number;
  onPress?: () => void;
  className?: string;
  children?: ReactNode;
  /** 글래스 틴트 색 (iOS 26 리퀴드글래스에서만 적용) */
  tintColor?: string;
}

/**
 * 리퀴드글래스 원형 컨테이너.
 * iOS 26+에서는 `expo-glass-effect`의 글래스가 적용되고,
 * 그 외 플랫폼(Android·구버전 iOS)에서는 반투명 흰색으로 폴백되어
 * 크로스 플랫폼에서 시각적으로 일관되게 보입니다.
 */
export default function GlassCircle({ size, onPress, className, children, tintColor }: Props) {
  const fallbackBg = isLiquidGlassAvailable() ? undefined : 'rgba(255, 255, 255, 0.2)';

  const glass = (
    <GlassView
      glassEffectStyle="regular"
      isInteractive={!!onPress}
      tintColor={tintColor}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: fallbackBg,
        overflow: 'hidden',
      }}
    >
      {/* 네이티브 GlassView가 자식 flex 정렬을 보장하지 않아, 꽉 채운 래퍼로 중앙 정렬 */}
      <View style={StyleSheet.absoluteFill} className="items-center justify-center">
        {children}
      </View>
    </GlassView>
  );

  if (!onPress) {
    return <View className={className}>{glass}</View>;
  }

  return (
    <Pressable className={className} onPress={onPress} hitSlop={8}>
      {glass}
    </Pressable>
  );
}
