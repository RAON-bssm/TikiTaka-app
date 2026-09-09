import FeedCard from '@/components/feed/FeedCard';
import NeighborhoodSheet from '@/components/profile/NeighborhoodSheet';
import ProfileSummarySkeleton from '@/components/profile/ProfileSummarySkeleton';
import UserProfile from '@/components/profile/UserProfile';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Header from '@/components/ui/Header';
import NavRow from '@/components/ui/NavRow';
import Typography from '@/components/ui/Typography';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import { useMyProfile } from '@/hooks/user/useMyProfile';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// TODO: 서버 연동 시 TanStack Query로 대체 (내가 올린 게시물)
const MY_FEEDS = [
  {
    id: 1,
    author: {
      name: '그만말해인제',
    },
    imageUrl: 'https://i.pinimg.com/736x/f8/95/1a/f8951a0f7b8523223d87d0ab42498056.jpg',
    title: '영도 맛도리 전봇대',
    place: '부산시 영도구',
    timeAgo: '3분 전',
    likeCount: 1,
  },
  {
    id: 2,
    author: {
      name: '그만말해인제',
    },
    imageUrl: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
    title: '오늘의 동네 한 컷',
    place: '부산시 영도구',
    timeAgo: '1시간 전',
    likeCount: 12,
  },
];

/** 서브 동네 미설정 시 안내. 서버는 이 경우 `sub_location_name` 키 자체를 주지 않는다. */
const NO_SUB_LOCATION_TEXT = '동네를 추가해보세요';

export default function ProfileScreen() {
  const [isNeighborhoodSheetOpen, setIsNeighborhoodSheetOpen] = useState(false);
  // 꾸미기 화면과 같은 저장된 config를 공유한다(수정 시 즉시 반영).
  const { config: character } = useCharacterConfig();
  // 표시용이라 동네를 이름으로만 받는다. 동네를 고치는 화면은 useMyInfo(id 포함)를 쓴다.
  const { data: profile, isLoading, isError, refetch } = useMyProfile();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerClassName="gap-2xl grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-col gap-2xl bg-white p-xl border-b border-gray-100">
          <Header />
          {isLoading ? (
            <ProfileSummarySkeleton />
          ) : isError || !profile ? (
            <ErrorRetry message="프로필을 불러오지 못했어요." onRetry={refetch} />
          ) : (
            <>
              <UserProfile
                character={character}
                point={profile.point}
                userName={profile.user_name}
                userPlace={profile.main_location_name}
              />
              <NavRow
                title="동네 확인하기"
                description={profile.sub_location_name ?? NO_SUB_LOCATION_TEXT}
                onPress={() => setIsNeighborhoodSheetOpen(true)}
              />
            </>
          )}
          {/* 화면 이동일 뿐이라 프로필 요청 결과와 무관하게 항상 보여준다.
              캐릭터 꾸미기는 기기 로컬 데이터라 요청이 실패해도 정상 동작한다. */}
          <View className="flex flex-row gap-md w-full">
            <Button
              content="프로필 수정"
              variant="light"
              className="flex-1"
              onclick={() => router.push('/profile/edit')}
            />
            <Button
              content="캐릭터 꾸미기"
              variant="light"
              className="flex-1"
              onclick={() => router.push('/profile/character')}
            />
          </View>
        </View>

        <View className="flex flex-1 flex-col gap-lg bg-white rounded-t-md p-xl border-t border-gray-100">
          <Typography variant="h2" className="text-gray-700">
            게시물 보관함
          </Typography>
          <View className="flex flex-col gap-md">
            {MY_FEEDS.map((feed) => (
              <FeedCard
                key={feed.id}
                postId={String(feed.id)}
                author={feed.author}
                imageUrl={feed.imageUrl}
                title={feed.title}
                place={feed.place}
                timeAgo={feed.timeAgo}
                likeCount={feed.likeCount}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <NeighborhoodSheet
        visible={isNeighborhoodSheetOpen}
        onClose={() => setIsNeighborhoodSheetOpen(false)}
      />
    </SafeAreaView>
  );
}
