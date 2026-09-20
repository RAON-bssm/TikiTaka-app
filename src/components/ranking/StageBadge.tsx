import { View } from 'react-native';

import Typography from '@/components/ui/Typography';
import type { Stage } from '@/types/match';

interface Props {
  stage?: Stage;
}

export default function StageBadge({ stage }: Props) {
  if (!stage) {
    return null;
  }

  return (
    <View className="w-full flex-row items-center gap-md rounded-full border border-gray-200 bg-white px-lg py-sm">
      <View className="h-md w-md rounded-full bg-primary-600" />
      <Typography variant="h4" className="text-primary-600">
        시즌 {stage.season}
      </Typography>
      <View className="h-md border-l border-primary-300" />
      <Typography variant="body3" className="flex-1 text-center text-gray-700">
        {stage.round}라운드 집계 중
      </Typography>
    </View>
  );
}
