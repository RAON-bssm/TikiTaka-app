import type { ReactNode } from 'react';
import { View } from 'react-native';

import GuideCharacter from '@/components/tutorial/GuideCharacter';
import Typography from '@/components/ui/Typography';

interface GuideBubbleProps {
  message: string;
  children?: ReactNode;
}

export default function GuideBubble({ message, children }: GuideBubbleProps) {
  return (
    <View className="gap-sm">
      <GuideCharacter size={112} />
      <View className="gap-lg rounded-lg bg-white p-lg">
        <Typography variant="body2" className="text-gray-800">
          {message}
        </Typography>
        {children ? (
          <View className="flex-row items-center justify-end gap-lg">{children}</View>
        ) : null}
      </View>
    </View>
  );
}
