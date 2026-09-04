import type { ConfigContext } from 'expo/config';

/**
 * 정적 설정은 전부 `app.json`에 두고, 여기서는 **환경변수가 필요한 설정만** 덧붙인다.
 * `app.json`은 순수 JSON이라 `process.env`를 읽을 수 없어서 이 파일이 존재한다.
 * (Expo는 두 파일이 모두 있으면 app.json을 먼저 읽어 `config`로 넘겨준다)
 *
 * 카카오 네이티브 앱 키는 값이 없으면 **URL 스킴(`kakao{앱키}://oauth`)이 잘못 생성되어**
 * 빌드는 성공하는데 로그인만 조용히 실패한다. 그래서 없으면 여기서 즉시 throw한다.
 * prebuild/빌드 단계에서 바로 터지는 편이 원인 찾기에 훨씬 낫다.
 *
 * `EXPO_PUBLIC_` 접두사를 붙이지 않은 이유: 이 값은 앱 JS 코드가 아니라 빌드 시점의
 * Node(이 파일)에서만 쓰이므로, 굳이 JS 번들에 포함시킬 필요가 없다.
 */
const KAKAO_NATIVE_APP_KEY = process.env.KAKAO_NATIVE_APP_KEY;

/**
 * 평문 HTTP(`http://`) API 서버를 쓰는 동안에만 iOS ATS 예외를 열어줄 호스트. https면 null.
 *
 * iOS의 ATS는 기본적으로 평문 HTTP를 막는다. API 주소가 `http://<공인 IP>:<포트>`면
 * 예외 없이는 요청이 앱 밖으로 나가지도 못하고 곧바로 네트워크 에러가 난다.
 * `NSAllowsLocalNetworking`은 `.local`·링크로컬 주소만 허용하므로 공인 IP는 해당되지
 * 않는다. (시뮬레이터·디버그 빌드도 똑같이 막힌다)
 *
 * 주소를 하드코딩하지 않고 `EXPO_PUBLIC_API_URL`에서 호스트만 뽑아 쓴다. 서버가 바뀌면
 * `.env`만 고쳐 다시 prebuild 하면 되고, https로 옮기면 예외가 저절로 사라진다.
 */
const cleartextHost = (() => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) return null;

  let url: URL;
  try {
    url = new URL(apiUrl);
  } catch {
    // 스킴이 빠진 값(`43.201.205.114` 같은)이 여기서 걸린다. 이런 값은 axios baseURL로도
    // 쓸 수 없어(상대 경로가 되어 요청이 전송조차 되지 않는다) 조용히 넘기면 안 된다.
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

  // https 는 ATS 예외가 필요 없으므로 null.
  return url.protocol === 'http:' ? url.hostname : null;
})();

/**
 * ATS 예외 도메인의 키로 쓸 문자열. 호스트명이면 그대로, IP 주소면 CIDR 표기로 바꾼다.
 *
 * `NSExceptionDomains`는 원래 **도메인 이름만** 키로 받는다. `43.201.205.114`처럼 숫자 IP를
 * 그대로 적으면 어떤 예외에도 매칭되지 않아, 예외를 넣었는데도 계속 조용히 차단된다.
 * iOS 17부터 이 키가 CIDR 표기를 지원하므로, IP는 단일 호스트 마스크(IPv4 `/32`,
 * IPv6 `/128`)를 붙여야 실제로 걸린다.
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
        // 생성되는 Info.plist의 NSAppTransportSecurity를 통째로 대체하므로,
        // Expo가 기본으로 넣어주던 로컬 네트워크 허용도 함께 적어준다.
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
