import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/header';
import Dropdown from '@/components/ui/input/Dropdown';
import Typography from '@/components/ui/Typography';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditRegion() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={['top']}>
      <View className="flex flex-1 flex-col items-start justify-between gap-4xl p-lg">
        <View className="flex flex-col items-center gap-2xl w-full">
          <Header />
          <View className="flex flex-col items-start gap-3xl w-full">
            <BackButton title="동네 수정" />
            <Typography variant="display" className="text-gray-700">
              동네 정보 입력
            </Typography>
            <View className="flex flex-row items-end gap-sm w-full">
              <View className="flex-1">
                <Dropdown
                  label="동네"
                  placeholder="시"
                  options={['부산시', '서울시', '대구시', '인천시', '광주시', '대전시', '울산시']}
                />
              </View>
              <View className="flex-1">
                <Dropdown
                  placeholder="구"
                  options={['영도구', '사상구', '기장군', '연제구', '강서구', '수영구', '해운대구']}
                />
              </View>
            </View>
          </View>
        </View>
        <View className="w-full">
          <Button content="등록하기" />
        </View>
      </View>
    </SafeAreaView>
  );
}
