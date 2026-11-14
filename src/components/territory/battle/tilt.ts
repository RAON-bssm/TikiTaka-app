import type { ViewStyle } from 'react-native';

export const TILT = {
  left: { transform: [{ rotate: '-3deg' }] },
  right: { transform: [{ rotate: '3deg' }] },
  sticker: { transform: [{ rotate: '-6deg' }] },
  none: {},
} satisfies Record<string, ViewStyle>;
