import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface Props {
  size: number;
  onPress?: () => void;
  className?: string;
  children?: ReactNode;
  /** iOS 26 리퀴드글래스에서만 적용된다. */
  tintColor?: string;
}

/** 리퀴드글래스 원. 글래스를 못 쓰는 플랫폼(Android·구버전 iOS)은 반투명 흰색으로 폴백한다. */
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
