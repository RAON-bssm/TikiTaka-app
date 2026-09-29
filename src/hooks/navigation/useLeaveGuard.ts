import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';

type LeaveGuard = (proceed: () => void) => void;

let activeGuard: LeaveGuard | null = null;

/**
 * 탭 전환처럼 **화면이 제거되지 않는 이동**을 막는다. 제거되는 이동(뒤로 가기 등)은 `usePreventRemove`가 맡는다.
 * 탭 전환은 떠나는 화면이 아니라 누른 탭으로 이벤트가 가서 화면 쪽에서 막을 수 없으므로,
 * 이동을 일으키는 쪽(앱바·헤더)이 `guardedNavigate`로 감싸 먼저 물어본다.
 */
export function useLeaveGuard(enabled: boolean, onAttempt: LeaveGuard) {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!enabled || !isFocused) return;
    activeGuard = onAttempt;
    return () => {
      if (activeGuard === onAttempt) activeGuard = null;
    };
  }, [enabled, isFocused, onAttempt]);
}

/** 막는 화면이 없으면 바로 이동하고, 있으면 그 화면에 확인을 맡긴다. */
export function guardedNavigate(navigate: () => void) {
  if (activeGuard) activeGuard(navigate);
  else navigate();
}
