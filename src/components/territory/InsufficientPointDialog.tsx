import { Modal, Pressable, View } from 'react-native';

import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';

interface Props {
  /** 있으면 연다. */
  target?: { dongName: string; toll: number; myPoint: number };
  onClose: () => void;
  /** 이 땅은 포기하고 지도에서 다른 땅을 고르게 한다. */
  onPickAnother: () => void;
}

export default function InsufficientPointDialog({ target, onClose, onPickAnother }: Props) {
  const shortage = target ? target.toll - target.myPoint : 0;

  return (
    <Modal
      visible={!!target}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 items-center justify-center bg-black/25 px-xl" onPress={onClose}>
        {target && (
          <Pressable
            onPress={() => {}}
            className="w-full gap-lg rounded-lg border border-gray-100 bg-white p-lg"
          >
            <View className="items-center gap-lg">
              <Typography variant="h3" className="text-gray-700">
                포인트가 부족해요
              </Typography>
              <Typography variant="body3" className="text-center text-gray-400">
                {`${target.dongName}에 도전하기에는 ${shortage.toLocaleString()} P가 부족해요`}
              </Typography>
            </View>
            <View className="gap-sm rounded-sm border border-gray-200 bg-white p-md">
              <Row label={`${target.dongName} 통행료`} value={target.toll} />
              <Row label="내 포인트" value={target.myPoint} />
              <Row label="부족한 포인트" value={shortage} highlight />
            </View>
            <Button content="다른 땅 도전하기" size="sm" onclick={onPickAnother} />
          </Pressable>
        )}
      </Pressable>
    </Modal>
  );
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <View className="flex-row items-center justify-between">
      <Typography variant="body3" className="text-gray-700">
        {label}
      </Typography>
      <Typography variant="body3" className={highlight ? 'text-primary-600' : 'text-gray-400'}>
        {`${value.toLocaleString()} P`}
      </Typography>
    </View>
  );
}
