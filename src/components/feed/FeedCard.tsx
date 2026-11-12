import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import PlaceIcon from '@/assets/icons/place.svg';
import Character from '@/components/character/Character';
import LikeButton from '@/components/feed/LikeButton';
import UserCharacter from '@/components/character/UserCharacter';
import LoadingImage from '@/components/ui/feedback/LoadingImage';
import MoreMenu, { type MoreMenuItem } from '@/components/ui/MoreMenu';
import Typography from '@/components/ui/Typography';
import { DEFAULT_CHARACTER_CONFIG } from '@/constants/character/assets';
import { palette } from '@/constants/colors';
import type { EditingPost } from '@/components/feed/PostEditDialog';
import { useViewUrl } from '@/hooks/storage/useViewUrl';

const COLOR_GRAY = palette.gray[400];

interface Props {
  postId: string;
  authorName: string;
  /** 없으면 기본 캐릭터로 렌더한다. */
  authorUserId?: string;
  imageUrl: string;
  title: string;
  place: string;
  timeAgo: string;
  /** 없으면 좋아요 버튼을 숨긴다. (내 게시물 목록은 좋아요 수를 주지 않는다) */
  likeCount?: number;
  liked?: boolean;
  /** 삭제 메뉴 노출 여부(본인 글일 때만). */
  isMine?: boolean;
  /** 수정 메뉴 노출 여부. 본인 글이어도 심사 전이면(MyPostList) 숨긴다. */
  canEdit?: boolean;
  /**
   * 부모가 `setEditingPost`(useState setter)를 그대로 넘기면 매 렌더마다 새 함수가
   * 만들어지지 않아 `React.memo`가 의미 있다. postId·content는 여기서 채워 올린다.
   */
  onEditPress?: (post: EditingPost) => void;
  onDeletePress?: (postId: string) => void;
  /** 심사 상태처럼 카드 위쪽에 짧게 붙일 표시. */
  badge?: string;
  /** 화면 맨 위 1~2장처럼 먼저 보이는 카드에 'high'를 준다. */
  imagePriority?: 'low' | 'normal' | 'high';
}

function FeedCard({
  postId,
  authorName,
  authorUserId,
  imageUrl,
  title,
  place,
  timeAgo,
  likeCount,
  liked,
  isMine,
  canEdit,
  onEditPress,
  onDeletePress,
  badge,
  imagePriority,
}: Props) {
  // imageUrl은 이미지 key라 조회 URL로 변환해야 한다.
  const { uri: resolvedImageUri, isLoading: imageLoading } = useViewUrl(imageUrl);

  const menuItems: MoreMenuItem[] = [];
  if (canEdit) {
    menuItems.push({
      label: '수정하기',
      onPress: () => onEditPress?.({ postId, content: title }),
    });
  }
  if (isMine) {
    menuItems.push({
      label: '삭제하기',
      destructive: true,
      onPress: () => onDeletePress?.(postId),
    });
  }

  return (
    <Pressable
      onPress={() => router.push(`/feed/${postId}`)}
      className="w-full gap-lg rounded-md border border-gray-100 bg-white p-lg active:opacity-90"
    >
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-row items-center gap-sm">
          {authorUserId ? (
            <UserCharacter userId={authorUserId} size={40} />
          ) : (
            <Character config={DEFAULT_CHARACTER_CONFIG} size={40} />
          )}
          <Typography variant="body2" className="text-gray-800">
            {authorName}
          </Typography>
        </View>
        <View className="flex-row items-center gap-sm">
          {badge ? (
            <View className="rounded-full bg-primary-100 px-md py-xs">
              <Typography variant="caption" className="text-primary-600">
                {badge}
              </Typography>
            </View>
          ) : null}
          {menuItems.length ? <MoreMenu items={menuItems} /> : null}
        </View>
      </View>

      <LoadingImage
        uri={imageLoading ? undefined : resolvedImageUri}
        cacheKey={imageUrl}
        priority={imagePriority}
        className="h-[225px] w-full rounded-lg"
      />

      <View className="w-full flex-row items-center justify-between gap-md">
        <View className="flex-1 gap-xs">
          <Typography variant="h3" className="text-gray-800">
            {title}
          </Typography>
          <View className="flex-row items-center gap-sm">
            <View className="flex-row items-center gap-xs">
              <PlaceIcon width={20} height={20} color={COLOR_GRAY} />
              <Typography variant="body3" className="text-gray-400">
                {place}
              </Typography>
            </View>
            <Typography variant="body3" className="text-gray-400">
              ·
            </Typography>
            <Typography variant="body3" className="text-gray-400">
              {timeAgo}
            </Typography>
          </View>
        </View>

        {likeCount !== undefined && (
          <LikeButton
            postId={postId}
            likeCount={likeCount}
            liked={liked}
            className="items-center justify-center"
            textClassName="text-gray-700"
          />
        )}
      </View>
    </Pressable>
  );
}

export default memo(FeedCard);
