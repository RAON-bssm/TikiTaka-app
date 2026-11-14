import type { InfiniteData } from '@tanstack/react-query';

import type { PostPage } from '@/api/post';
import type { MyPost, Post } from '@/types/post';

/** `postKeys.lists()` 아래에는 배열 목록(홈 미리보기·내 게시물)과 무한 스크롤 피드(페이지 묶음)가 섞여 있다. */
export type PostListCache = Post[] | MyPost[] | InfiniteData<PostPage>;

export function mapPostList(
  data: PostListCache,
  update: <T extends Post | MyPost>(post: T) => T,
): PostListCache {
  if (Array.isArray(data)) return data.map(update) as Post[] | MyPost[];
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, posts: page.posts.map(update) })),
  };
}

export function hasPost(data: PostListCache | undefined, postId: string): boolean {
  if (!data) return false;
  const posts: (Post | MyPost)[] = Array.isArray(data)
    ? data
    : data.pages.flatMap((page) => page.posts);
  return posts.some((post) => post.post_id === postId);
}
