import FeedCard from '@/components/feed/FeedCard';
import NeighborhoodSheet from '@/components/profile/NeighborhoodSheet';
import UserProfile from '@/components/profile/UserProfile';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/header';
import NavRow from '@/components/ui/NavRow';
import Typography from '@/components/ui/Typography';
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
      avatarUrl: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
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
      avatarUrl: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
    },
    imageUrl: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
    title: '오늘의 동네 한 컷',
    place: '부산시 영도구',
    timeAgo: '1시간 전',
    likeCount: 12,
  },
];

export default function ProfileScreen() {
  const [isNeighborhoodSheetOpen, setIsNeighborhoodSheetOpen] = useState(false);
  const character = {
    body: 'body02',
    eyes: 'eyes01',
    eyesColor: 'orange',
    mouth: 'mouth01',
    hairBack: 'long',
    hairFront: 'basic',
    hairColor: 'black',
    clothing: 'clothing01',
  };
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerClassName="gap-2xl grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-col gap-2xl bg-white p-xl border-b border-gray-100">
          <Header />
          <UserProfile
            character={character}
            point={9999}
            userName="그만말해인제"
            userPlace="부산시 영도구"
          />
          <NavRow
            title="동네 확인하기"
            description="부산시 사상구"
            onPress={() => setIsNeighborhoodSheetOpen(true)}
          />
          <View className="flex flex-row gap-md w-full">
            <Button
              content="프로필 수정"
              variant="light"
              className="flex-1"
              onclick={() => router.push('/profile/edit-region')}
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
