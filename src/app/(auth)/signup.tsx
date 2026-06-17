import BackButton from '@/components/ui/BackButton';
import Dropdown from '@/components/ui/input/Dropdown';
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
      <View className="flex flex-row gap-sm items-end w-full">
        <View className="flex-1">
          <Dropdown
            label="동네"
            placeholder="시/도"
            options={['부산시', '서울시', '대구시', '인천시', '광주시', '대전시', '울산시']}
          />
        </View>
        <View className="flex-1">
          <Dropdown
            placeholder="구/군"
            options={['영도구', '사상구', '기장군', '연제구', '강서구', '수영구', '해운대구']}
          />
        </View>
      </View>
    </View>
  );
};
export default SignUp;
