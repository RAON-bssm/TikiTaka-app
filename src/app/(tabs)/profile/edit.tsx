import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/Header';
import TextInput from '@/components/ui/input/TextInput';
import Typography from '@/components/ui/Typography';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfile() {
  const [nickname, setNickname] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col items-start justify-between gap-4xl p-lg">
        <View className="flex flex-col items-center gap-2xl w-full">
          <Header />
          <View className="flex flex-col items-start gap-3xl w-full">
            <BackButton title="프로필 수정" />
            <Typography variant="display" className="text-gray-600">
              프로필 정보 입력
            </Typography>
            <View className="flex flex-row items-end gap-sm w-full">
              <View className="flex-1">
                <TextInput
                  label="닉네임"
                  placeholder="닉네임을 입력해주세요"
                  value={nickname}
                  onChangeText={setNickname}
                />
              </View>
              <Button content="중복확인" />
            </View>
          </View>
        </View>
        <View className="w-full">
          <Button content="수정하기" />
        </View>
      </View>
    </SafeAreaView>
  );
}
