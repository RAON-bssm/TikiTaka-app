import BackButton from '@/components/ui/BackButton';
import { Text, View } from 'react-native';

const SignUp = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <BackButton />
      <Text className="text-xl font-bold text-gray-900">회원 정보 등록</Text>
    </View>
  );
};
export default SignUp;
