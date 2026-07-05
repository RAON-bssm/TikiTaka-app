import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import { Pressable, View } from 'react-native';
import Typography from './Typography';

interface Props {
  title: string;
  description?: string;
  onPress?: () => void;
}

export default function NavRow({ title, description, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex flex-row items-center justify-between rounded-md bg-gray-200 p-lg"
    >
      <View className="flex flex-col gap-xs">
        <Typography variant="h3" className="text-gray-800">
          {title}
        </Typography>
        {description && (
          <Typography variant="body3" className="text-gray-600">
            {description}
          </Typography>
        )}
      </View>
      <ChevronRightIcon width={24} height={24} color="#9DAABB" />
    </Pressable>
  );
}
