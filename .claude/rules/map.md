---
paths:
  - 'src/app/(tabs)/map/**'
  - 'src/app/(tabs)/_layout.tsx'
  - 'src/hooks/map/**'
  - 'src/types/mapBridge.ts'
---

# 지도 (카카오맵 WebView)

지도 화면은 웹 레포(`TikiTaka-webview`)의 카카오맵 페이지를 WebView로 띄웁니다. 브리지 타입(`src/types/mapBridge.ts`)은 웹 레포의 `src/bridge/bridge.ts`와 함께 바꿉니다.

## 지도 탭은 Android에서만 미리 마운트

`(tabs)/_layout.tsx`의 `lazy: Platform.OS !== 'android'`. 플랫폼 일치 원칙의 예외이며, 화면과 동작은 같고 로드 시점만 다릅니다.

- 측정(앱 완전 종료 후 재실행, 탭 진입 → 지도 표시 대기): Android 약 924ms → 약 75ms, iOS 약 736ms → 약 791ms(효과 없음).
- 숨겨진 탭은 뷰 계층에서 떼어져 WebView가 보이지 않는 상태가 됩니다. Android(Chromium)는 그리기만 멈추고 JS·네트워크는 계속 돌아 SDK·타일 로드를 미리 끝내지만, iOS(WebKit)는 보이지 않는 페이지의 타이머·`requestAnimationFrame`을 멈춰 로드 체인(SDK → `ready` → `init` → 지도 생성 → 타일)이 진행되지 않는 것으로 보입니다(추정, 단계별 로그로는 미확인).
- Android는 지도 탭을 열지 않아도 앱 실행마다 WebView 메모리·네트워크를 쓰고 카카오맵 호출량이 늘어납니다. iOS까지 켜려면 먼저 숨겨진 상태에서 로드가 끝나는지 측정하세요.

## 브리지는 하위 호환으로만 바꾼다

지도 웹은 앱과 따로 배포되어, 웹을 배포하면 스토어에 이미 나간 앱에도 바로 적용됩니다.

- 새 메시지 type 추가와 선택(`?`) 필드 추가만 합니다. 양쪽 모두 모르는 type은 무시하므로, 옛 앱·옛 웹과 섞여도 깨지지 않습니다.
- 기존 메시지의 필드를 지우거나 필수로 바꾸거나 의미를 바꾸지 마세요. 꼭 바꿔야 하면 새 type을 추가하고, 옛 type은 그것을 보내는 앱 버전이 모두 내려갈 때까지 남깁니다.
- 앱 PR은 웹 PR보다 늦게, 또는 함께 머지합니다. 웹이 아직 처리하지 않는 메시지를 앱이 보내면 무시되어 기능이 덜 동작합니다.
