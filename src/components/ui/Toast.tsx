import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CheckIcon from '@/assets/icons/check.svg';
import Typography from './Typography';

interface ToastOptions {
  /** ms */
  duration?: number;
}

interface ToastState {
  id: number;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // 매번 새 id(key)를 줘야 연속 호출에도 등장 애니메이션이 다시 돈다.
    setToast({ id: Date.now(), message });

    timerRef.current = setTimeout(() => setToast(null), options?.duration ?? 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* box-none: 아래 화면 터치를 막지 않는다. */}
      <View
        pointerEvents="box-none"
        className="absolute inset-x-lg bottom-0 items-center"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        {toast && (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(200)}
            exiting={FadeOutDown.duration(200)}
            className="w-full flex-row items-center gap-md rounded-full bg-white px-md py-sm shadow-md"
          >
            <CheckIcon width={32} height={32} />
            <Typography variant="body2" className="flex-1">
              {toast.message}
            </Typography>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast는 <ToastProvider> 내부에서만 사용할 수 있어요.');
  }
  return context;
}
