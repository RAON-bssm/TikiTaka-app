import type { ConfigContext } from 'expo/config';

// 정적 설정은 app.json에 두고, 여기서는 환경변수가 필요한 설정만 덧붙인다.
//
// 카카오 앱 키가 없으면 URL 스킴(`kakao{앱키}://oauth`)이 잘못 생성되어 빌드는 되고 로그인만
// 조용히 실패하므로, 빌드 시점에 throw한다. 빌드 때만 쓰므로 `EXPO_PUBLIC_`을 붙이지 않는다.
const KAKAO_NATIVE_APP_KEY = process.env.KAKAO_NATIVE_APP_KEY;

/**
 * API가 평문 HTTP일 때만 iOS ATS 예외를 열 호스트(https면 null). ATS가 http를 막아
 * 예외 없이는 즉시 네트워크 에러가 나고, `NSAllowsLocalNetworking`은 공인 IP를 허용하지 않는다.
 */
const cleartextHost = (() => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) return null;

  let url: URL;
  try {
    url = new URL(apiUrl);
  } catch {
    // 스킴이 빠진 값은 axios baseURL에서 상대 경로가 되어 요청이 안 나가므로 조용히 넘기지 않는다.
    throw new Error(
      `EXPO_PUBLIC_API_URL 형식이 잘못됐습니다: "${apiUrl}"\n` +
        'http:// 또는 https:// 로 시작하는 전체 주소여야 합니다. (예: http://43.201.205.114:8090)',
    );
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(
      `EXPO_PUBLIC_API_URL 의 프로토콜이 잘못됐습니다: "${apiUrl}" (protocol: ${url.protocol})\n` +
        'http:// 또는 https:// 로 시작하는 전체 주소여야 합니다. (예: http://localhost:8090)',
    );
  }

  return url.protocol === 'http:' ? url.hostname : null;
})();

/**
 * `NSExceptionDomains`는 IP를 그대로 적으면 매칭되지 않아 조용히 차단된다.
 * iOS 17+ CIDR 표기를 쓰도록 IP에는 `/32`·`/128`을 붙인다.
 */
const toExceptionDomainKey = (host: string) => {
  // URL.hostname은 IPv6를 대괄호째 돌려준다(`http://[::1]:8090` → `[::1]`).
  const bare = host.replace(/^\[|\]$/g, '');

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(bare)) return `${bare}/32`;
  if (bare.includes(':')) return `${bare}/128`;
  return bare;
};

// 반환 타입은 추론에 맡긴다. ExpoConfig로 못 박으면 name/slug가 optional인
// ConfigContext['config']와 안 맞아, app.json에 이미 있는 값을 여기에 또 적어야 한다.
export default ({ config }: ConfigContext) => {
  if (!KAKAO_NATIVE_APP_KEY) {
    throw new Error(
      'KAKAO_NATIVE_APP_KEY 환경변수가 없습니다.\n' +
        '- 로컬: .env 에 KAKAO_NATIVE_APP_KEY=<카카오 네이티브 앱 키> 추가\n' +
        '- EAS:  eas env:create --name KAKAO_NATIVE_APP_KEY --value <키>\n' +
        '카카오 네이티브 앱 키는 https://developers.kakao.com 내 애플리케이션 > 앱 키에서 확인합니다.',
    );
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        // NSAppTransportSecurity를 통째로 대체하므로 Expo 기본값(로컬 네트워크 허용)도 함께 적는다.
        ...(cleartextHost && {
          NSAppTransportSecurity: {
            NSAllowsArbitraryLoads: false,
            NSAllowsLocalNetworking: true,
            NSExceptionDomains: {
              [toExceptionDomainKey(cleartextHost)]: { NSExceptionAllowsInsecureHTTPLoads: true },
            },
          },
        }),
      },
    },
    plugins: [
      ...(config.plugins ?? []),
      ['@react-native-seoul/kakao-login', { kakaoAppKey: KAKAO_NATIVE_APP_KEY }],
    ],
  };
};
