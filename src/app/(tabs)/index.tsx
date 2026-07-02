import DistrictBattleStatus from '@/components/feed/DistrictBattleStatus';
import FeedPreviewCard from '@/components/feed/FeedPreviewCard';
import Banner from '@/components/ui/banner/Banner';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { Pressable, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const user = {
    name: '하린',
    profile: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
  };

  const feedPreviews = [
    {
      id: 1,
      imgUrl: 'https://i.pinimg.com/736x/f8/95/1a/f8951a0f7b8523223d87d0ab42498056.jpg',
      user,
      place: '영도구',
    },
    {
      id: 2,
      imgUrl: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
      user,
      place: '강서구',
    },
    {
      id: 3,
      imgUrl: 'https://i.pinimg.com/736x/f8/95/1a/f8951a0f7b8523223d87d0ab42498056.jpg',
      user,
      place: '해운대구',
    },
    {
      id: 4,
      imgUrl: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
      user,
      place: '수영구',
    },
  ];
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex-1 gap-2xl px-xl pt-lg">
        <Banner />

        <View className="flex flex-col gap-sm">
          <DistrictBattleStatus
            myTeam={{ name: '강서구', score: 99 }}
            opponentTeam={{ name: '영도구', score: 67 }}
          />
          <Button content="바로 참여" />
        </View>

        <View className="flex flex-col gap-md">
          <View className="flex flex-row justify-between w-full items-center">
            <Typography variant="h3" className="text-gray-900">
              동네 훔쳐보기
            </Typography>
            <Pressable>
              <Typography variant="body2" className="text-gray-600">
                더보기
              </Typography>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-md"
          >
            {feedPreviews.map((feed) => (
              <FeedPreviewCard
                key={feed.id}
                imgUrl={feed.imgUrl}
                user={feed.user}
                place={feed.place}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
