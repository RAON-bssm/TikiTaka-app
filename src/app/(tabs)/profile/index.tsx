import PlaceIcon from '@/assets/icons/place.svg';
import Character from '@/components/character/Character';
import Header from '@/components/ui/header';
import PointBadge from '@/components/ui/PointBadge';
import Typography from '@/components/ui/Typography';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
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
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-2xl px-xl pt-lg"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-col gap-2xl">
          <Header />
          <View className="flex flex-row justify-between items-center">
            <View className="flex flex-row justify-content items-center gap-sm">
              <Character config={character} size={72} />
              <View className="flex flex-col ">
                <Typography variant="h2" className="text-gray-800">
                  그만말해인제
                </Typography>
                <View className="flex flex-row items-center gap-xs">
                  <PlaceIcon width={24} height={24} color="#9DAABB" />
                  <Typography variant="body2" className="text-gray-500 text-[10px]">
                    부산시 영도구
                  </Typography>
                </View>
              </View>
            </View>
            <PointBadge point={9999} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
