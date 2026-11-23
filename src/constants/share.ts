/**
 * 공유 링크 도메인. 지도 웹뷰(TikiTaka-webview)와 같은 Vercel 프로젝트라, 그쪽 `public/.well-known/`의
 * 도메인 인증 파일과 `/p/:id` 안내 페이지가 함께 배포돼야 링크로 앱이 열린다.
 * 바꾸면 `app.json`의 `associatedDomains`·`intentFilters`도 같이 바꿔야 한다.
 */
export const SHARE_ORIGIN = 'https://web-view.raon-tikitaka.shop';

export const getPostShareUrl = (postId: string) =>
  `${SHARE_ORIGIN}/p/${encodeURIComponent(postId)}`;
