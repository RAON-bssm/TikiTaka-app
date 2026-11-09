import type { ComponentType } from 'react';

// 라우트 파일은 릴리즈에도 번들된다. 목 서버와 미리보기 화면이 릴리즈에 들어가지 않도록
// __DEV__ 분기 안에서만 불러온다(릴리즈 빌드에서는 상수 접기로 require째 빠진다).
const DevTerritoryScreen: ComponentType = __DEV__
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- 정적 import는 __DEV__와 무관하게 번들된다
    require('@/components/dev/DevTerritoryScreen').default
  : () => null;

export default function DevTerritoryRoute() {
  return <DevTerritoryScreen />;
}
