import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { type FC, useRef, useState } from 'react';
import { type LayoutChangeEvent, Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

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
  icon?: FC<SvgProps>;
  iconColor?: string;
}

const MENU_GAP = 4;
// className의 shadow-*는 플랫폼마다 다르게 그려져(Android는 elevation), 양쪽이 같은 boxShadow를 직접 쓴다.
const MENU_SHADOW = `0px 4px 16px ${palette.gray[800]}1F`;
const MENU_RADIUS = 12;

export default function MoreMenu({
  items,
  icon: Icon = MoreIcon,
  iconColor = palette.gray[500],
}: Props) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{
    triggerTop: number;
    triggerBottom: number;
    right: number;
  }>();
  const [menuHeight, setMenuHeight] = useState<number>();

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ triggerTop: y, triggerBottom: y + height, right: windowWidth - (x + width) });
    });
  };

  const close = () => setAnchor(undefined);

  // 화면 아래쪽 버튼에서 아래로 열면 메뉴가 화면 밖으로 잘려, 아래 공간이 모자라고 위가 더 넓으면 위로 연다.
  // 어느 쪽도 모자라면 안전 영역 안으로 밀어 넣는다.
  // 높이를 재기 전 첫 프레임은 투명하게 두어 위치가 튀는 게 보이지 않게 한다.
  const safeTop = insets.top;
  const safeBottom = windowHeight - insets.bottom;
  const position = anchor && {
    top: (() => {
      const below = anchor.triggerBottom + MENU_GAP;
      if (menuHeight === undefined) return below;
      const spaceBelow = safeBottom - below;
      const spaceAbove = anchor.triggerTop - MENU_GAP - safeTop;
      const top =
        menuHeight > spaceBelow && spaceAbove > spaceBelow
          ? anchor.triggerTop - MENU_GAP - menuHeight
          : below;
      return Math.max(safeTop, Math.min(top, safeBottom - menuHeight));
    })(),
    right: anchor.right,
    opacity: menuHeight === undefined ? 0 : 1,
  };
  const handleMenuLayout = (event: LayoutChangeEvent) => {
    setMenuHeight(event.nativeEvent.layout.height);
  };

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
        className={item.destructive ? 'text-primary-600' : 'text-gray-500'}
      >
        {item.label}
      </Typography>
    </Pressable>
  ));

  return (
    <>
      <Pressable ref={triggerRef} onPress={open} hitSlop={8} className="active:opacity-70">
        <Icon width={24} height={24} color={iconColor} />
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
        {position && hasGlass ? (
          <GlassView
            glassEffectStyle="regular"
            colorScheme="light"
            onLayout={handleMenuLayout}
            style={{
              position: 'absolute',
              ...position,
              borderRadius: MENU_RADIUS,
              overflow: 'hidden',
            }}
          >
            <View className="w-[140px] py-xs">{rows}</View>
          </GlassView>
        ) : position ? (
          <View
            onLayout={handleMenuLayout}
            style={{
              position: 'absolute',
              ...position,
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
