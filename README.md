## 커밋 컨벤션

| 태그 이름 | 설명                                                                      |
| --------- | ------------------------------------------------------------------------- |
| Feat      | 새로운 기능을 추가할 경우                                                 |
| Fix       | 버그를 고친 경우                                                          |
| Style     | 코드 포맷 변경, 세미 콜론 누락, 코드 수정이 없는 경우                     |
| Design    | UI/UX 디자인 변경                                                         |
| Refactor  | 프로덕션 코드 리팩토링                                                    |
| Docs      | 문서를 수정한 경우                                                        |
| Chore     | 빌드 태스트 업데이트, 패키지 매니저를 설정하는 경우(프로덕션 코드 변경 X) |

---

## 시작하기 (Getting Started)

프로젝트를 처음 클론한 후 아래 순서대로 실행해 주세요.

### 1. 패키지 설치

Husky 설정이 포함되어 있어 설치 후 자동으로 git hook이 활성화됩니다.

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

---

## 카카오 로그인 설정 (Kakao Login)

카카오 로그인은 **네이티브 SDK**(`@react-native-seoul/kakao-login`)를 사용합니다.
네이티브 모듈이라 **Expo Go에서는 동작하지 않고, development build가 필요합니다.**

### 1. 카카오 앱 등록

[Kakao Developers](https://developers.kakao.com) → 내 애플리케이션에서 앱을 만들고 아래를 설정합니다.

- **플랫폼 등록**
  - Android: 패키지명 `com.anonymous.TikiTaka` + 키 해시
  - iOS: 번들 ID `com.tikitaka.raon`
- **카카오 로그인 활성화** (ON)
- **동의항목**: 서버가 `kapi.kakao.com/v2/user/me`로 사용자를 식별하므로 최소한 프로필 정보는 필요

Android 키 해시는 아래로 뽑습니다. (디버그용)

```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore \
  -storepass android -keypass android | openssl sha1 -binary | openssl base64
```

### 2. 네이티브 앱 키 넣기

`app.json`의 `PUT_KAKAO_NATIVE_APP_KEY_HERE`를 발급받은 **네이티브 앱 키**로 교체합니다.

```jsonc
["@react-native-seoul/kakao-login", { "kakaoAppKey": "발급받은_네이티브_앱_키" }]
```

> 이 값은 `.env`가 아니라 `app.json`에 둡니다. 네이티브 앱 키는 URL 스킴(`kakao{앱키}://oauth`)으로
> 앱 바이너리에 어차피 노출되는 **공개값**이고, 감춘다고 얻는 게 없습니다. 오히려 `.env`는
> gitignore 대상이라 EAS 클라우드 빌드에 올라가지 않아 빌드가 깨집니다.
> 반대로 **REST API 키와 client secret은 앱에 절대 넣지 않습니다.** 코드↔토큰 교환은 카카오 SDK가
> 처리하고, 앱은 발급받은 access token만 서버로 넘깁니다.

### 3. 네이티브 코드 재생성 후 빌드

`ios/`, `android/` 는 생성물이라 gitignore되어 있습니다. 앱 키를 바꾼 뒤에는 반드시 다시 만들어야 합니다.

```bash
pnpm expo prebuild --clean
pnpm ios      # 또는 pnpm android
```

---

## 주요 명령어 (Scripts)

- `pnpm dev` 또는 `pnpm start`: 로컬 개발 서버 실행
- `pnpm lint`: ESLint 검사
- `pnpm lint:fix`: ESLint 검사 및 자동 교정
- `pnpm format`: Prettier 코드 포맷팅
