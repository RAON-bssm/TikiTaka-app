import type { ViewStyle } from 'react-native';

/** NativeWind의 rotate 유틸이 기기에서 적용되지 않아 transform은 style로 준다. */
export const TILT = {
  left: { transform: [{ rotate: '-3deg' }] },
  right: { transform: [{ rotate: '3deg' }] },
  sticker: { transform: [{ rotate: '-6deg' }] },
  none: {},
} satisfies Record<string, ViewStyle>;
