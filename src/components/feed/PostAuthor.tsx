import PlaceIcon from '@/assets/icons/place.svg';
import { palette } from '@/constants/colors';
import useRelativeTime from '@/hooks/useRelativeTime';
import { View } from 'react-native';
import UserCharacter from '../character/UserCharacter';
import MoreMenu, { type MoreMenuItem } from '../ui/MoreMenu';
import Typography from '../ui/Typography';

interface Props {
  name: string;
  userId: string;
  place: string;
  createdAt: string;
  menuItems?: MoreMenuItem[];
}

export default function PostAuthor({ name, userId, place, createdAt, menuItems }: Props) {
  const timeAgo = useRelativeTime(createdAt);
  return (
    <View className="flex flex-row items-center gap-lg">
      <UserCharacter userId={userId} size={56} />
      <View className="flex flex-1 flex-col gap-xs">
        <Typography variant="h3" className="text-gray-800">
          {name}
        </Typography>
        <View className="flex flex-row items-center gap-sm">
          <View className="flex flex-row items-center gap-xs">
            <PlaceIcon width={20} height={20} color={palette.gray[400]} />
            <Typography variant="body3" className="text-gray-400">
              {place}
            </Typography>
          </View>
          <Typography variant="body3" className="text-gray-400">
            ·
          </Typography>
          <Typography variant="body3" className="text-gray-400">
            {timeAgo}
          </Typography>
        </View>
      </View>
      {menuItems?.length ? <MoreMenu items={menuItems} /> : null}
    </View>
  );
}
