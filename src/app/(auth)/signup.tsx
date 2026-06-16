import BackButton from '@/components/ui/BackButton';
import TextInput from '@/components/ui/input/TextInput';
import Typography from '@/components/ui/Typography';
import { View } from 'react-native';

const SignUp = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <BackButton title="정보등록" link={'/login'} />
      <Typography variant="display" className="text-gray-900">
        회원 정보 등록
      </Typography>
      <TextInput label="닉네임" placeholder="닉네임을 입력해주세요" />
    </View>
  );
};
export default SignUp;
