import FavoriteIcon from '@/assets/icons/favorite.svg';
import InfoIcon from '@/assets/icons/info.svg';
import PlaceIcon from '@/assets/icons/place.svg';
import Header from '@/components/ui/header';
import Typography from '@/components/ui/Typography';
import { Image, View } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View className="flex flex-col gap-lg">
          {/* 작성자 정보 */}
          <View className="flex flex-row items-center gap-md">
            <Image
              source={{ uri: post.user.profile }}
              style={{ width: 40, height: 40 }}
              className="rounded-full bg-gray-50"
            />
            <View className="flex flex-col gap-xs">
              <Typography variant="body2" className="text-gray-900">
                {post.user.name}
              </Typography>
              <View className="flex flex-row items-center gap-sm">
                <View className="flex flex-row items-center gap-xs">
                  <PlaceIcon width={12} height={12} color="#9DAABB" />
                  <Typography variant="body3" className="text-gray-500 text-[10px]">
                    {post.place}
                  </Typography>
                </View>
                <Typography variant="body3" className="text-gray-500 text-[10px]">
                  ·
                </Typography>
                <Typography variant="body3" className="text-gray-500 text-[10px]">
                  {post.createdAt}
                </Typography>
              </View>
            </View>
          </View>

          {/* 피드 이미지 */}
          <Image
            source={{ uri: post.imgUrl }}
            style={{ width: '100%', height: 320 }}
            className="rounded-lg bg-gray-200"
          />
        </View>

        {/* 제목 · 장소 / 좋아요 */}
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center gap-xs">
            <Typography variant="h3" className="text-gray-900">
              {post.user.name}
            </Typography>
            <Typography variant="h3" className="text-gray700">
              ·
            </Typography>
            <Typography variant="body2" className="text-gray-700">
              {post.title}
            </Typography>
          </View>
          <View className="flex flex-row items-center gap-xs">
            <FavoriteIcon width={20} height={20} color="#FC8253" />
            <Typography variant="body3" className="text-gray-700">
              {post.likeCount}
            </Typography>
          </View>
        </View>

        {/* AI 평가 카드 */}
        <View className="relative flex flex-row items-center gap-xl rounded-md bg-gray-50 p-lg">
          <View className="absolute right-sm top-sm">
            <InfoIcon width={24} height={24} color="#C4CCDA" />
          </View>
          <View className="flex flex-col items-center gap-xs">
            <Typography variant="h3" className="text-gray-900">
              AI 평가 점수
            </Typography>
            <Typography
              variant="display"
              className="text-primary-600 text-[64px] leading-[72px] font-bold"
            >
              {post.aiScore}
            </Typography>
          </View>
          <View className="h-[81px] w-[2px] rounded-xs bg-gray-300" />
          <Typography variant="body3" className="flex-1 pr-xl pt-md text-gray-800 leading-5">
            {post.aiComment}
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
