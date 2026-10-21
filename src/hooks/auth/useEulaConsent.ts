import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

// 서버에 동의 이력이 없어 기기에 둔다. 재설치하면 다시 동의를 받는다.
const EULA_CONSENT_KEY = 'eulaConsentAgreed';

/** 로그인 전 약관 동의 여부. 기기에 한 번 동의하면 다음 로그인부터는 다시 묻지 않는다. */
export function useEulaConsent() {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(EULA_CONSENT_KEY).then((value) => {
      setHasAgreed(value === 'true');
      setIsLoaded(true);
    });
  }, []);

  const markAgreed = () => {
    setHasAgreed(true);
    void SecureStore.setItemAsync(EULA_CONSENT_KEY, 'true');
  };

  return { hasAgreed, isLoaded, markAgreed };
}
