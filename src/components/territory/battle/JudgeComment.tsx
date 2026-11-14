import { View } from 'react-native';

import Typography from '@/components/ui/Typography';

export default function JudgeComment({ review }: { review: string }) {
  return (
    <View className="gap-sm">
      <Typography variant="h4" className="text-gray-700">
        AI 심판 한마디
      </Typography>
      <View className="rounded-lg rounded-tl-xs border border-gray-100 bg-white p-lg">
        <Typography variant="body3" className="text-gray-600">
          {review}
        </Typography>
      </View>
    </View>
  );
}
