import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CheckIcon from '@/assets/icons/check.svg';
import Typography from './Typography';

/**
 * 앱 어디서든 호출할 수 있는 토스트 알림.
 *
 * 사용법:
 *   1) 앱 루트(_layout)를 <ToastProvider> 로 감싼다.
 *   2) 컴포넌트에서 const { showToast } = useToast();
 *      showToast('게시물이 등록됐어요');
 */

interface ToastOptions {
  /** 표시 시간(ms). 기본 2000. */
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
  // 다음 토스트가 오면 이전 자동 닫힘 타이머를 취소하기 위해 보관한다.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // id를 매번 새로 줘서 연속 호출 시에도 재등장 애니메이션이 다시 실행되게 한다.
    setToast({ id: Date.now(), message });

    timerRef.current = setTimeout(() => setToast(null), options?.duration ?? 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* 오버레이: 화면 하단. box-none 으로 아래 화면 터치를 막지 않는다. */}
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
            <Typography variant="body1" className="flex-1">
              {toast.message}
            </Typography>
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

/** 토스트를 띄우는 훅. ToastProvider 하위에서만 사용 가능. */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast는 <ToastProvider> 내부에서만 사용할 수 있어요.');
  }
  return context;
}
