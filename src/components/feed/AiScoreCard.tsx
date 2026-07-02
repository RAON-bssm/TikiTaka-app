import InfoIcon from '@/assets/icons/info.svg';
import { View } from 'react-native';
import Typography from '../ui/Typography';

interface Props {
  score: number;
  comment: string;
}

export default function AiScoreCard({ score, comment }: Props) {
  return (
    <View className="relative flex flex-row items-center gap-xl rounded-md bg-white p-lg border border-gray-200">
      <View className="absolute right-sm top-sm">
        <InfoIcon width={24} height={24} color="#C4CCDA" />
      </View>
      <View className="flex flex-col items-center gap-xs">
        <Typography variant="h3" className="text-gray-900">
          AI 평가 점수
        </Typography>
        <Typography
          variant="display"
          className="text-primary-600 text-[64px] leading-[72px] font-bold"
        >
          {score}
        </Typography>
      </View>
      <View className="h-[81px] w-[2px] rounded-xs bg-gray-300" />
      <Typography variant="body3" className="flex-1 pr-xl pt-md text-gray-800 leading-5">
        {comment}
      </Typography>
    </View>
  );
}
