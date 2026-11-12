import { useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * 요청 중에 화면을 나가면 호출부의 onSuccess(결과 화면 이동)가 실행되지 않아 결과를 놓친다.
 * Android 하드웨어 뒤로 가기와 iOS 스와이프를 함께 막는다. 화면의 뒤로 가기 버튼은 `disabled`로 따로 막는다.
 */
export function useBlockLeaveWhilePending(isPending: boolean) {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !isPending });
  }, [navigation, isPending]);

  useEffect(() => {
    if (!isPending) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [isPending]);
}
