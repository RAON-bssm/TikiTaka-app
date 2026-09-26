import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useRef, useState } from 'react';
import { Modal, Pressable, useWindowDimensions, View } from 'react-native';

import MoreIcon from '@/assets/icons/more-vert.svg';
import { palette } from '@/constants/colors';
import Typography from './Typography';

export interface MoreMenuItem {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  items: MoreMenuItem[];
}

const MENU_GAP = 4;
// className의 shadow-*는 플랫폼마다 다르게 그려져(Android는 elevation), 양쪽이 같은 boxShadow를 직접 쓴다.
const MENU_SHADOW = `0px 4px 16px ${palette.gray[800]}1F`;
const MENU_RADIUS = 12;

export default function MoreMenu({ items }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ top: number; right: number }>();

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + MENU_GAP, right: windowWidth - (x + width) });
    });
  };

  const close = () => setAnchor(undefined);

  // iOS 26 미만·Android는 글래스가 없어 흰 카드로 폴백한다.
  const hasGlass = isLiquidGlassAvailable();

  const rows = items.map((item) => (
    <Pressable
      key={item.label}
      onPress={() => {
        close();
        item.onPress();
      }}
      className={`px-lg py-md ${hasGlass ? 'active:opacity-60' : 'active:bg-gray-50'}`}
    >
      <Typography
        variant="body2"
        className={item.destructive ? 'text-primary-600' : 'text-gray-800'}
      >
        {item.label}
      </Typography>
    </Pressable>
  ));

  return (
    <>
      <Pressable ref={triggerRef} onPress={open} hitSlop={8} className="active:opacity-70">
        <MoreIcon width={24} height={24} color={palette.gray[500]} />
      </Pressable>

      {/* statusBarTranslucent가 없으면 Android에서 모달 좌표가 상태바 높이만큼 어긋나 measureInWindow 값과 맞지 않는다. */}
      <Modal
        visible={!!anchor}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable className="absolute inset-0" onPress={close} />
        {anchor && hasGlass ? (
          <GlassView
            glassEffectStyle="regular"
            colorScheme="light"
            style={{
              position: 'absolute',
              top: anchor.top,
              right: anchor.right,
              borderRadius: MENU_RADIUS,
              overflow: 'hidden',
            }}
          >
            <View className="w-[140px] py-xs">{rows}</View>
          </GlassView>
        ) : anchor ? (
          <View
            style={{
              position: 'absolute',
              top: anchor.top,
              right: anchor.right,
              boxShadow: MENU_SHADOW,
            }}
            className="w-[140px] overflow-hidden rounded-md border border-gray-100 bg-white py-xs"
          >
            {rows}
          </View>
        ) : null}
      </Modal>
    </>
  );
}
