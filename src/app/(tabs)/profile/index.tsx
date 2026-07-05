import UserProfile from '@/components/profile/UserProfile';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/header';
import NavRow from '@/components/ui/NavRow';
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
          <UserProfile
            character={character}
            point={9999}
            userName="그만말해인제"
            userPlace="부산시 영도구"
          />
          <NavRow title="동네 확인하기" description="부산시 사상구" onPress={() => {}} />
          <View className="flex flex-row gap-md w-full">
            <Button content="프로필 수정" variant="light" className="flex-1" />
            <Button content="캐릭터 꾸미기" variant="light" className="flex-1" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
