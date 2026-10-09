---
paths:
  - 'src/api/**'
  - 'src/hooks/**'
  - 'src/types/**'
  - 'src/app/**'
---

# API 연동 규약

서버 연동 코드는 **api 모듈 → 훅 → 화면** 3계층으로 나눕니다. 도메인마다 파일이 겹치지 않아 여러 사람이 동시에 다른 도메인을 붙일 수 있습니다.

| 계층     | 위치                         | 책임                                                   |
| -------- | ---------------------------- | ------------------------------------------------------ |
| api 모듈 | `src/api/<도메인>.ts`        | 엔드포인트 호출. 공통 래퍼를 벗겨 **도메인 값만** 반환 |
| 훅       | `src/hooks/<도메인>/use*.ts` | `useQuery`/`useMutation`. 쿼리 키와 캐시 무효화 담당   |
| 화면     | `src/app/**`                 | 로딩·에러 UI, 토스트 등 **사용자에게 보이는 것**       |

## api 모듈

`ApiResponse<T>` 래퍼는 api 모듈에서 벗기고, 훅·화면에는 도메인 값만 넘깁니다.

```ts
export async function getBoards(): Promise<Board[]> {
  const { data } = await client.get<ApiResponse<BoardListData>>('/api/board');
  return data.data.board; // 래퍼는 여기서 끝난다
}
```

- 요청·응답 타입은 `src/types/<도메인>.ts`에 두고 api 모듈이 import 합니다.
- data가 없는 API는 제네릭에 `EmptyResponse`를 넣고 `Promise<void>`로 선언합니다. **서버가 주지 않는 값을 반환 타입에 적지 마세요.**

## 쿼리 키 · 캐시 무효화

- `src/api/queryKeys.ts`의 팩토리만 사용합니다. 훅에 문자열 배열을 직접 쓰지 마세요. 새 도메인은 여기에 키를 먼저 추가합니다. (규칙은 파일 상단 주석 참고)
- 무효화는 도메인의 `all`을 씁니다. 접두사가 겹치므로 목록과 상세가 함께 갱신됩니다.
- **다른 도메인까지 바뀌면 그 키도 함께 무효화**합니다. 예를 들어 게시물 삭제는 서버에서 동네·개인 점수를 차감하므로 랭킹 키도 무효화해야 화면이 맞습니다.

## 에러 처리 · 로딩 UI

- 실패 문구는 `getApiErrorMessage(error, fallback)`(`src/api/error.ts`)로 만듭니다. 서버가 보낸 사유를 우선 쓰고, 없을 때만 fallback으로 내려갑니다.
- **토스트는 화면에서 띄웁니다.** 훅의 `onError`와 호출부의 `onError`가 **둘 다** 실행되므로, 훅에 넣으면 같은 메시지가 두 번 뜹니다.
- 재시도·`staleTime` 기본값은 `src/api/queryClient.ts`에 있습니다. 훅에서 꼭 필요할 때만 덮어쓰세요.
- 로딩은 `Skeleton`, 실패는 `ErrorRetry`(`src/components/ui/feedback/`)를 씁니다. `ErrorRetry`에는 `refetch`를 넘깁니다. 스피너나 실패 화면을 새로 만들지 마세요.

## 새 도메인 연동 절차

1. `src/types/<도메인>.ts`에 요청·응답 타입 (대부분 이미 정의돼 있습니다)
2. `src/api/queryKeys.ts`에 쿼리 키 추가
3. `src/api/<도메인>.ts`에 호출 함수
4. `src/hooks/<도메인>/`에 훅
5. 화면의 목 데이터를 제거하고 훅 연결

## 서버 응답의 함정

엔드포인트별 세부 사항은 `src/types/<도메인>.ts`의 주석에 있습니다.

- **값이 없는 필드는 null이 아니라 키가 아예 빠집니다**(서버 `non_null` 설정). 그런 필드는 옵셔널(`?`)로 선언합니다.
- **성공 여부는 HTTP 상태로 판단합니다.** 바디의 `status`는 HTTP 상태와 다를 수 있습니다.
- 시큐리티 필터에서 막힌 401/403은 공통 래퍼가 아니라 스프링 기본 바디라 `message`가 비어 있을 수 있습니다. `getApiErrorMessage`가 이를 처리합니다.
- 일시(`DateTimeString`)는 타임존 오프셋이 없는 KST 기준 문자열입니다.
- **이미지 필드(`post_image` 등)는 URL이 아니라 S3 key입니다.** `<Image>`에 넣으려면 `useViewUrl`로 presigned URL을 받아야 합니다.
- 배열 키가 단수형인 경우가 많습니다(`product`, `match`, `board`). 추측하지 말고 타입을 확인하세요.
- `match_type` 등 일부 enum은 이름이 아니라 한글 설명(`'일반 매치'`, `'미션 위크'`)으로 내려옵니다.
- 매치 팀 이름은 `'부산광역시 북구'`처럼 시/도까지 붙은 이름입니다. 이름이 같은 구가 여러 시/도에 있으니 동네 비교는 `formatLocationName`(`src/constants/location.ts`)으로 맞춘 문자열로 합니다.
