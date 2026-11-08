import type { ReactNode } from 'react';
import { View } from 'react-native';

import Typography from '@/components/ui/Typography';

interface Props {
  label: string;
  value?: string;
  children?: ReactNode;
}

/** 도전·방어 결과 화면의 "항목 — 값" 한 줄. 값을 꾸며야 하면 children으로 넘긴다. */
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
