import { getAnalytics, logScreenView } from '@react-native-firebase/analytics';
import { useSegments } from 'expo-router';
import { useEffect } from 'react';

/**
 * 화면 전환마다 GA4 screen_view를 남긴다. firebase.json에서 자동 화면 수집을 껐다
 * (RN은 Activity/ViewController가 하나라 자동 수집으로는 화면이 구분되지 않는다).
 */
export default function useScreenTracking() {
  const segments = useSegments();
  // 실제 경로(/feed/123) 대신 라우트 패턴(/feed/[post_id])을 보내야 게시글마다 화면이 따로 집계되지 않는다.
  const screenName = `/${segments.filter((segment) => !segment.startsWith('(')).join('/')}`;

  useEffect(() => {
    logScreenView(getAnalytics(), { screen_name: screenName, screen_class: screenName }).catch(
      () => {},
    );
  }, [screenName]);
}
