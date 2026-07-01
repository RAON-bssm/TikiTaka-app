import Character from '@/components/character/Character';
import FeedPreviewCard from '@/components/feed/FeedPreviewCard';
import type { CharacterConfig } from '@/constants/character/types';
import { Text, View } from 'react-native';

const EXAMPLE_CHARACTER: CharacterConfig = {
  body: 'body01',
  eyes: 'eyes01',
  eyesColor: 'sky',
  mouth: 'mouth02',
  hairBack: 'bob',
  hairFront: 'basic',
  hairColor: 'brown',
  clothing: 'clothing02',
  accessory: 'red-glasses',
};

export default function HomeScreen() {
  const user = {
    name: '하린',
    profile: 'https://i.pinimg.com/736x/db/4b/95/db4b954a0e9191b2d38e69b2568f7013.jpg',
  };
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold text-gray-900">메인페이지입니다</Text>
      <Character config={EXAMPLE_CHARACTER} size={220} />
      <FeedPreviewCard
        imgUrl="https://i.pinimg.com/736x/f8/95/1a/f8951a0f7b8523223d87d0ab42498056.jpg"
        user={user}
        place="영도구"
      />
    </View>
  );
}
