import AiScoreCard from '@/components/feed/AiScoreCard';
import PostAuthor from '@/components/feed/PostAuthor';
import PostImage from '@/components/feed/PostImage';
import PostTitleRow from '@/components/feed/PostTitleRow';
import Header from '@/components/ui/header';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PostDetailScreen() {
  const post = {
    user: {
      name: '사이다사주',
      profile: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
    },
    place: '영도구',
    createdAt: '3분 전',
    imgUrl: 'https://i.pinimg.com/736x/f8/95/1a/f8951a0f7b8523223d87d0ab42498056.jpg',
    title: '영도 맛도리 전봇대',
    likeCount: 1,
    aiScore: 67,
    aiComment:
      '사진이 너무 흐릿해서 뭐라는 모르겠고 나무의 색깔과 모양이 마음에 안들어요. 저건 무엇인지도 모르겠고 사진 찍는 연습을 더하시길 바라요.',
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View className="flex flex-col gap-lg">
          <PostAuthor
            name={post.user.name}
            profile={post.user.profile}
            place={post.place}
            createdAt={post.createdAt}
          />
          <PostImage uri={post.imgUrl} />
        </View>

        <PostTitleRow authorName={post.user.name} title={post.title} likeCount={post.likeCount} />

        <AiScoreCard score={post.aiScore} comment={post.aiComment} />
      </ScrollView>
    </SafeAreaView>
  );
}
