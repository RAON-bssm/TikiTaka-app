---
paths:
  - 'src/app/**'
  - 'src/components/**'
  - 'tailwind.config.js'
  - 'src/constants/colors.js'
---

# 디자인 시스템 & 테마 토큰

색상·간격·폰트 등 디자인 값은 모두 `tailwind.config.js`의 `theme.extend`에 토큰으로 정의되어 있습니다. **임의값(`p-[13px]`, `text-[#FF8800]`, `bg-[#123456]` 등)을 쓰지 말고 반드시 토큰을 사용하세요.** (hook이 차단합니다.) 새 값이 필요하면 `tailwind.config.js`에 토큰을 먼저 추가합니다.

## 색상

팔레트 값은 `src/constants/colors.js` 한 곳에 있고 `tailwind.config.js`가 이를 가져다 씁니다.

- **`gray`** 50~800: 중립색. **순백은 `gray` 스케일에 없으므로 `bg-white`/`text-white`/`border-white`를 사용한다.**
- **`primary`** 대표색 `primary-600`(주황): 브랜드 강조·CTA. **`secondary`** 대표색 `secondary-500`(파랑): 보조 강조.
- **`kakao`**, `kakao-pressed`: 카카오 로그인 버튼 전용 브랜드색. 다른 용도로 쓰지 마세요.
- SVG `color`처럼 className이 아니라 JS 값으로 색이 필요하면 `palette`(`@/constants/colors`)를 import 합니다. hex 리터럴을 직접 쓰지 마세요.

## 간격 · 반경

간격(`p-`, `m-`, `gap-` 등)과 반경(`rounded-`)은 토큰(`xs`~`4xl`, `full`)만 사용합니다. 값은 `tailwind.config.js` 참고. 같은 이름이라도 값이 다를 수 있습니다(`xl`: spacing 20px, radius 24px).

- 요소 고유 크기(`w-`, `h-`)는 대응 토큰이 없어 디자인 값 그대로의 임의값(`w-[60px]` 등)을 허용합니다. 간격·반경·색·폰트 크기에는 임의값을 쓰지 마세요.

## 타이포그래피

- **텍스트는 raw `<Text>` 대신 `src/components/ui/Typography.tsx`의 `Typography`를 사용합니다.** `variant`로 스타일을 지정하고(`display`, `h1`~`h4`, `body1`~`body3`, `caption`), 추가 스타일은 `className`으로 얹습니다.
- 폰트 패밀리: `font-regular`/`font-medium`/`font-bold`(Pretendard), `font-sans`(= Pretendard-Medium, body 기본), `font-title`(OkDanDan-Bold, 제목 전용). 폰트는 `app.json`의 `expo-font` 플러그인으로 로드됩니다.

## NativeWind `safelist` 주의

- 클래스를 **동적으로 조합**하면(변수로 클래스명을 만들 때) `content` 글롭에 문자열이 그대로 나타나지 않아 빌드에서 제거됩니다. 그런 클래스는 `safelist`에 등록하세요. `Typography`의 클래스가 `safelist`에 있는 이유입니다.
- `content` 글롭은 `src/app/`, `src/components/`, `src/features/`만 스캔합니다(`src/features/`는 설정에만 있고 현재 쓰지 않습니다). `src/constants/`나 `src/hooks/`에 클래스 문자열을 두면 빌드에 포함되지 않으니, 컴포넌트 쪽에 두거나 `safelist`에 등록하세요.
