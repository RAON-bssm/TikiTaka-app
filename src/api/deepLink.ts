/**
 * 공유 링크로 들어왔는데 로그인이 안 돼 있으면 AuthGate가 로그인 화면으로 보내 목적지가 사라진다.
 * AuthGate가 로그인 화면으로 보내는 순간 그 게시글 id를 여기에 잠깐 들고 있다가, 로그인 직후 그 화면으로 보낸다.
 * 메모리에만 둔다(앱을 끄면 버린다).
 */
let pendingPostId: string | null = null;

export function setPendingPostId(postId: string): void {
  pendingPostId = postId;
}

export function clearPendingPostId(): void {
  pendingPostId = null;
}

export function consumePendingPostId(): string | null {
  const postId = pendingPostId;
  pendingPostId = null;
  return postId;
}
