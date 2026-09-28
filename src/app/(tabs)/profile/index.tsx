import MyPostList from '@/components/profile/MyPostList';
import NeighborhoodSheet from '@/components/profile/NeighborhoodSheet';
import ProfileSummarySkeleton from '@/components/profile/ProfileSummarySkeleton';
import UserProfile from '@/components/profile/UserProfile';
import Button from '@/components/ui/Button';
import ErrorRetry from '@/components/ui/feedback/ErrorRetry';
import Header from '@/components/ui/Header';
import NavRow from '@/components/ui/NavRow';
import Typography from '@/components/ui/Typography';
import { formatLocationName } from '@/constants/location';
import { useCharacterConfig } from '@/hooks/character/useCharacterConfig';
import { useMyProfile } from '@/hooks/user/useMyProfile';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [isNeighborhoodSheetOpen, setIsNeighborhoodSheetOpen] = useState(false);
  const { config: character } = useCharacterConfig();
  const { data: profile, isLoading, isError, refetch } = useMyProfile();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerClassName="gap-2xl grow"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-col gap-2xl bg-white p-xl border-b border-gray-100">
          <Header />
          {isLoading ? (
            <ProfileSummarySkeleton />
          ) : isError || !profile ? (
            <ErrorRetry message="프로필을 불러오지 못했어요." onRetry={refetch} />
          ) : (
            <>
              <UserProfile
                character={character}
                point={profile.point}
                userName={profile.user_name}
                userPlace={formatLocationName(
                  profile.main_location_city_name,
                  profile.main_location_name,
                )}
                rank={profile.user_rank}
                score={profile.user_score}
              />
              <NavRow
                title="동네 확인하기"
                description={
                  profile.at_home
                    ? '본진에 있어요'
                    : `지금 ${formatLocationName(profile.current_location_city_name, profile.current_location_name)}에 있어요`
                }
                onPress={() => setIsNeighborhoodSheetOpen(true)}
              />
            </>
          )}
          {/* 화면 이동일 뿐이라 프로필 요청 결과와 무관하게 항상 보여준다. */}
          <View className="flex flex-row gap-md w-full">
            <Button
              content="프로필 수정"
              variant="light"
              className="flex-1"
              onclick={() => router.push('/profile/edit')}
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
          <MyPostList />
        </View>
      </ScrollView>

      <NeighborhoodSheet
        visible={isNeighborhoodSheetOpen}
        onClose={() => setIsNeighborhoodSheetOpen(false)}
      />
    </SafeAreaView>
  );
}
