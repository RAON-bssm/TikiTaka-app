import RadioOffIcon from '@/assets/icons/radio-selected.svg';
import RadioOnIcon from '@/assets/icons/radio.svg';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

interface Neighborhood {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

// TODO: 실제 사용자 동네 목록으로 대체
const NEIGHBORHOODS: Neighborhood[] = [
  { id: '1', name: '부산시 동래구' },
  { id: '2', name: '부산시 사상구' },
];

export default function NeighborhoodSheet({ visible, onClose }: Props) {
  const [selectedId, setSelectedId] = useState('2');
  const router = useRouter();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="flex flex-col gap-2xl">
        <View className="flex flex-col gap-md">
          <Typography variant="h1" className="text-gray-700">
            내 동네 설정
          </Typography>
          <Typography variant="body2" className="text-gray-400">
            최대 2개의 동네를 선택할 수 있어요.
          </Typography>
        </View>

        <View className="flex flex-col gap-lg">
          {NEIGHBORHOODS.map((neighborhood) => {
            const selected = neighborhood.id === selectedId;
            return (
              <Pressable
                key={neighborhood.id}
                onPress={() => setSelectedId(neighborhood.id)}
                className="flex flex-row items-center gap-xs"
              >
                {selected ? (
                  <RadioOnIcon width={24} height={24} />
                ) : (
                  <RadioOffIcon width={24} height={24} />
                )}
                <Typography
                  variant="body2"
                  className={selected ? 'text-primary-600' : 'text-gray-500'}
                >
                  {neighborhood.name}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        <Button
          content="동네 추가"
          onclick={() => router.push('/profile/edit-region')}
          className="w-full"
        />
      </View>
    </BottomSheet>
  );
}
