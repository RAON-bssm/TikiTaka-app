import { useFocusEffect, useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useCallback, useRef, useState } from 'react';

/**
 * 고친 내용이 있으면 뒤로 가기·스와이프처럼 화면이 제거되는 이동 전에 확인을 받는다.
 * 탭 전환은 화면이 스택에 남아 입력도 그대로라 막지 않는다.
 *
 * 저장 요청 중(`isPending`)에는 확인 없이 아예 나가지 못하게 한다. 이때 나가면 서버엔 저장되는데
 * "저장되지 않아요"라고 안내하게 되고, 호출부의 onSuccess(토스트·다음 화면 이동)도 실행되지 않는다.
 */
export function useConfirmLeave(isDirty: boolean, isPending = false) {
  const navigation = useNavigation();
  // 확인 뒤 이어 갈 이동. useState에 함수를 바로 넘기면 updater로 실행되므로 `() => fn`으로 감싸 넣는다.
  const [pendingLeave, setPendingLeave] = useState<() => void>();
  // 저장 성공 후 이동은 확인 없이 보낸다. isDirty는 다음 렌더에야 바뀌어 같은 틱의 router.back()을 막아 버린다.
  // 입력을 들고 다음 화면으로 간 경우도 허용해 둔다. 그 흐름이 끝나며 이 화면까지 한꺼번에 닫는다(router.dismiss(n)).
  const allowedRef = useRef(false);
  // 다음 화면에서 돌아오면 다시 확인을 받는다.
  useFocusEffect(
    useCallback(() => {
      allowedRef.current = false;
    }, []),
  );

  usePreventRemove(isDirty || isPending, ({ data }) => {
    if (allowedRef.current) {
      navigation.dispatch(data.action);
      return;
    }
    if (isPending) return;
    setPendingLeave(() => () => navigation.dispatch(data.action));
  });

  return {
    /** 저장 성공·다음 단계로 이동처럼 확인이 필요 없는 이동 직전에 부른다. */
    allowLeave: () => {
      allowedRef.current = true;
    },
    dialog: {
      visible: !!pendingLeave,
      onConfirm: () => {
        pendingLeave?.();
        setPendingLeave(undefined);
      },
      onCancel: () => setPendingLeave(undefined),
    },
  };
}
