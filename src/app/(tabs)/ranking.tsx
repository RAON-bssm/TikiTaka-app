import LocationHeader from '@/components/ui/ImageRanking';
import Ranking from '@/components/ui/Ranking';
import { Text, View } from 'react-native';

export default function RankingScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold text-gray-900">랭킹</Text>
      <Ranking number={1} location="한강공원" count={120} />
      <LocationHeader
        number={1}
        location="니코꼬리찜"
        address="부산시 사상구"
        count={580}
        imageUrl="https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg"
      />
    </View>
  );
}
