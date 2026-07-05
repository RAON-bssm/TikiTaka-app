import PointBadgeIcon from '@/assets/icons/point.svg';
import { View } from 'react-native';
import Typography from './Typography';

interface Props {
  point: number;
}

export default function PointBadge({ point }: Props) {
  return (
    <View className="flex flex-row items-center py-xs px-md rounded-full bg-secondary-100">
      <PointBadgeIcon />
      <Typography variant="body3" className="text-secondary-600">
        {point}
      </Typography>
    </View>
  );
}
