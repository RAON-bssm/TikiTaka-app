import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// 서버에 동의 이력이 없어 기기에 둔다. SecureStore(Keychain)는 앱 삭제 후에도 남아있어
// 재설치해도 동의 화면이 다시 안 뜨므로, 앱과 함께 지워지는 AsyncStorage를 쓴다.
const EULA_CONSENT_KEY = 'eulaConsentAgreed';

/** 로그인 전 약관 동의 여부. 기기에 한 번 동의하면 다음 로그인부터는 다시 묻지 않는다. */
export function useEulaConsent() {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(EULA_CONSENT_KEY)
      .then((value) => setHasAgreed(value === 'true'))
      // 조회 실패를 "미동의"로 처리해도 로그인 화면에서 바로 다시 동의할 수 있어 막히지 않는다.
      .catch(() => setHasAgreed(false))
      .finally(() => setIsLoaded(true));
  }, []);

  const markAgreed = () => {
    setHasAgreed(true);
    void AsyncStorage.setItem(EULA_CONSENT_KEY, 'true');
  };

  return { hasAgreed, isLoaded, markAgreed };
}
