import { useEffect } from 'react';
import { View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import Typography from './Typography';

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
};

export default function Toast({ message, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => onHide(), 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={{ position: 'absolute', bottom: 80, left: 16, right: 16 }}
      className="flex-row items-center gap-md rounded-full bg-white px-md py-sm shadow-md"
    >
      <CheckIcon width={32} height={32} />
      <Typography variant="body1">{message}</Typography>
    </View>
  );
}
