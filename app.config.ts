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
    plugins: [
      ...(config.plugins ?? []),
      ['@react-native-seoul/kakao-login', { kakaoAppKey: KAKAO_NATIVE_APP_KEY }],
    ],
  };
};
