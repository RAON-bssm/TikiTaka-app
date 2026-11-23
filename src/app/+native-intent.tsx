import { SHARE_ORIGIN } from '@/constants/share';

// 공유 링크(`https://<SHARE_ORIGIN>/p/<id>`, 카톡 인앱 브라우저의 "앱에서 보기"는 `tikitaka://p/<id>`)를
// 게시글 상세로 바꾼다. 웹 주소를 짧게 두려고 앱 라우트(`/post/<id>`)와 경로를 다르게 했다.
// 다른 링크에 `/p/`가 섞여 있어도 게시글로 바뀌지 않게, 공유 주소·앱 스킴·앱 경로의 맨 앞만 본다.
const escapedOrigin = SHARE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const POST_LINK_PATTERN = new RegExp(
  `^(?:${escapedOrigin}/|tikitaka:///?|/)?p/([^/?#]+)/?(?:[?#].*)?$`,
);

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  // 여기서 던지면 앱이 죽으므로, 해석하지 못하면 원래 경로를 그대로 넘긴다.
  try {
    const match = POST_LINK_PATTERN.exec(path);
    if (!match) return path;
    const postId = decodeURIComponent(match[1]);
    return `/post/${encodeURIComponent(postId)}`;
  } catch {
    return path;
  }
}
