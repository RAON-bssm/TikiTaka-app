// @ts-check
/**
 * 색상 팔레트 단일 소스(Single Source of Truth).
 *
 * `tailwind.config.js`(Node/CommonJS)와 앱 코드(TS) 양쪽이 이 파일 하나를 공유한다.
 * 그래서 CommonJS(`module.exports`)로 작성한다 — tailwind config 는 이 파일을 `require` 한다.
 *
 * 사용 규칙
 * - NativeWind className(`bg-primary-600`, `text-gray-500` 등)은 tailwind.config.js 를 통해 반영된다.
 * - SVG 아이콘 `color`/`fill` 처럼 JS 값(hex)이 필요한 곳은 `palette` 를 import 해서 쓴다.
 *   예: `import { palette } from '@/constants/colors'; palette.gray[500]`
 * - 컴포넌트에 hex 리터럴(`'#6E7D94'`)을 직접 박지 않는다. 색이 바뀌면 이 파일만 고치면 된다.
 *
 * 주의: `gray` 는 순백(#FFFFFF)을 포함하지 않는다. 흰색은 NativeWind `white`(=`#FFFFFF`)를 쓴다.
 */

const gray = {
  50: '#F8F9FB',
  100: '#EEF1F6',
  200: '#DDE2EC',
  300: '#C4CCDA',
  400: '#9DAABB',
  500: '#6E7D94',
  600: '#4A5568',
  700: '#2D3748',
  800: '#1A202C',
};

const primary = {
  100: '#FFF3EE',
  200: '#FED8CA',
  300: '#FEC6B0',
  400: '#FDAB8C',
  500: '#FD9B75',
  600: '#FC8253',
  700: '#E5764C',
  800: '#B35C3B',
  900: '#6A3723',
};

const secondary = {
  100: '#ECF2FF',
  200: '#C4D5FF',
  300: '#A7C1FF',
  400: '#6693FF',
  500: '#4078FF',
  600: '#3A6DE8',
  700: '#2D55B5',
  800: '#23428C',
  900: '#1B326B',
};

/** 전체 팔레트. 앱 코드에서 `palette.gray[500]` 형태로 접근한다. */
const palette = { gray, primary, secondary };

module.exports = { palette, gray, primary, secondary };
