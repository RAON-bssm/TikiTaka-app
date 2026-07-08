import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Header from '@/components/ui/header';
import RegionSelect from '@/components/ui/input/RegionSelect';
import Typography from '@/components/ui/Typography';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditRegion() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex flex-1 flex-col items-start justify-between gap-4xl p-lg">
        <View className="flex flex-col items-center gap-2xl w-full">
          <Header />
          <View className="flex flex-col items-start gap-3xl w-full">
            <BackButton title="동네 수정" />
            <Typography variant="display" className="text-gray-600">
              동네 정보 입력
            </Typography>
            <RegionSelect cityPlaceholder="시" districtPlaceholder="구" />
          </View>
        </View>
        <View className="w-full">
          <Button content="등록하기" />
        </View>
      </View>
    </SafeAreaView>
  );
}
