// @ts-check
/**
 * 색상 팔레트 단일 소스. tailwind.config.js가 `require` 하므로 CommonJS로 유지한다.
 * JS hex가 필요한 곳(SVG color 등)은 `palette`를 import 하고, hex 리터럴을 직접 쓰지 않는다.
 * `gray`에는 순백이 없다. 흰색은 `white`를 쓴다.
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

const palette = { gray, primary, secondary };

module.exports = { palette, gray, primary, secondary };
