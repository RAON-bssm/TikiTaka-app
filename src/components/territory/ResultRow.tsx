import type { ReactNode } from 'react';
import { View } from 'react-native';

import Typography from '@/components/ui/Typography';

interface Props {
  label: string;
  value?: string;
  children?: ReactNode;
}

export default function ResultRow({ label, value, children }: Props) {
  return (
    <View className="flex-row items-center justify-between gap-md">
      <Typography variant="body3" className="text-gray-700">
        {label}
      </Typography>
      {children ?? (
        <Typography variant="body3" className="text-gray-400">
          {value}
        </Typography>
      )}
    </View>
  );
}
