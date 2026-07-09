import CharacterCustomizer from '@/components/character/CharacterCustomizer';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/ui/header';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CharacterScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col gap-2xl px-lg pt-lg">
        <Header />
        <BackButton title="캐릭터 꾸미기" />
        <CharacterCustomizer />
      </View>
    </SafeAreaView>
  );
}
