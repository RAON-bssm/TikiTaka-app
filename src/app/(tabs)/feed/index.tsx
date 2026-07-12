import DistrictBattleStatus from '@/components/feed/DistrictBattleStatus';
import FeedCard from '@/components/feed/FeedCard';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/header';
import { usePosts } from '@/hooks/post/usePosts';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

// TODO: 서버 연동 시 TanStack Query로 대체
const FEEDS = [
  {
    id: 1,
    author: {
      name: '사이다사주',
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
      name: '니코꼬리찜',
      avatarUrl: 'https://i.pinimg.com/736x/f8/95/1a/f8951a0f7b8523223d87d0ab42498056.jpg',
    },
    imageUrl: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
    title: '사상구 숨은 맛집',
    place: '부산시 사상구',
    timeAgo: '12분 전',
    likeCount: 8,
  },
];

export default function FeedScreen() {
  const { data: posts, isLoading, isError } = usePosts(1);
  console.log('posts:', { posts, isLoading, isError });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <View className="flex flex-col gap-sm">
          <DistrictBattleStatus
            myTeam={{ name: '강서구', score: 99 }}
            opponentTeam={{ name: '영도구', score: 67 }}
          />
          <Button content="바로 참여" />
        </View>
        <View className="flex flex-col gap-md">
          {FEEDS.map((feed) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}
