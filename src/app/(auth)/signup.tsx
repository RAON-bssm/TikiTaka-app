import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import RegionSelect from '@/components/ui/input/RegionSelect';
import TextInput from '@/components/ui/input/TextInput';
import Typography from '@/components/ui/Typography';
import { View } from 'react-native';

export default function SignUp() {
  return (
    <View className="flex flex-col flex-1 items-start justify-between p-lg gap-4xl bg-white">
      <View className="flex flex-col items-start gap-4xl w-full">
        <BackButton title="정보등록" link={'/login'} />
        <Typography variant="display" className="text-gray-900">
          회원 정보 등록
        </Typography>
        <View className="flex flex-col gap-3xl w-full">
          <View className="flex flex-row gap-sm items-end w-full">
            <View className="flex-1">
              <TextInput label="닉네임" placeholder="닉네임을 입력해주세요" />
            </View>
            <Button content="중복확인" />
          </View>
          <RegionSelect />
        </View>
      </View>
      <View className="w-full">
        <Button content="가입하기" />
      </View>
    </View>
  );
}
