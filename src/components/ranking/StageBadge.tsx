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
    <View className="self-start rounded-full bg-gray-50 px-md py-xs">
      <Typography variant="caption" className="text-gray-500">
        시즌 {stage.season} · {stage.round}라운드 집계 중
      </Typography>
    </View>
  );
}
