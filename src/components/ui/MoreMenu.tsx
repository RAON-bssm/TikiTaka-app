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

  return (
    <>
      <Pressable ref={triggerRef} onPress={open} hitSlop={8} className="active:opacity-70">
        <MoreIcon width={24} height={24} color={palette.gray[500]} />
      </Pressable>

      {/* statusBarTranslucent가 없으면 Android에서 모달 좌표가 상태바 높이만큼 어긋나 measureInWindow 값과 맞지 않는다. */}
      <Modal
        visible={!!anchor}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable className="absolute inset-0" onPress={close} />
        {anchor ? (
          <View
            style={{ position: 'absolute', top: anchor.top, right: anchor.right }}
            className="min-w-[160px] rounded-md border border-gray-100 bg-white py-xs shadow-lg"
          >
            {items.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => {
                  close();
                  item.onPress();
                }}
                className="px-lg py-md active:bg-gray-50"
              >
                <Typography
                  variant="body1"
                  className={item.destructive ? 'text-primary-600' : 'text-gray-800'}
                >
                  {item.label}
                </Typography>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Modal>
    </>
  );
}
