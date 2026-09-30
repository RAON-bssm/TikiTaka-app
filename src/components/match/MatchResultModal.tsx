import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import CloseIcon from '@/assets/icons/close.svg';
import RingIcon from '@/assets/images/splash/ring.svg';
import StarIcon from '@/assets/images/splash/star.svg';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import type { Stage } from '@/types/match';

interface Props {
  visible: boolean;
  stage: Stage;
  onClose: () => void;
  onConfirm: () => void;
}

const GRADIENT_COLORS = [palette.primary[600], palette.primary[700]] as const;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatWithWeekday(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${month}.${day}(${WEEKDAYS[date.getDay()]})`;
}

/** 지난 라운드는 이번 라운드 시작일 바로 전날까지 7일간이다. */
function formatPreviousRoundRange(startedAt: string): string {
  const currentStart = new Date(startedAt);
  const prevEnd = new Date(currentStart.getTime() - DAY_MS);
  const prevStart = new Date(prevEnd.getTime() - 6 * DAY_MS);
  return `${formatWithWeekday(prevStart)} - ${formatWithWeekday(prevEnd)}`;
}

/** 라운드가 끝나 결과가 나왔을 때 홈 화면에 뜨는 안내 팝업. */
export default function MatchResultModal({ visible, stage, onClose, onConfirm }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={onClose}>
        {/* 빈 onPress로 탭을 삼켜 카드 안을 눌러도 닫히지 않게 한다 */}
        <Pressable onPress={() => {}} className="w-[300px] overflow-hidden rounded-lg">
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View className="absolute -bottom-2xl -left-2xl opacity-40">
            <RingIcon width={140} height={147} />
          </View>
          <View className="absolute right-lg top-xl" style={{ transform: [{ rotate: '-16deg' }] }}>
            <StarIcon width={56} height={66} />
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={8}
            className="absolute right-md top-md z-10 active:opacity-70"
          >
            <CloseIcon width={20} height={20} color="#fff" />
          </Pressable>

          <View className="w-full items-center gap-lg px-xl py-2xl">
            <View className="rounded-full bg-white px-lg py-xs">
              <Typography variant="h4" className="text-primary-700">
                {formatPreviousRoundRange(stage.started_at)}
              </Typography>
            </View>

            <Typography variant="display" className="text-white">
              대결 종료
            </Typography>

            <Typography variant="body2" className="text-center text-white">
              {'1주일 간의 동네리그가 끝났어요.\n우리 동네는 몇 등일까요?'}
            </Typography>

            <View className="w-full items-center gap-sm">
              <Button
                content="대결 결과 보기"
                variant="light"
                className="w-full"
                onclick={onConfirm}
              />
              <Pressable onPress={onClose} className="active:opacity-70">
                <Typography variant="caption" className="text-white">
                  나중에 볼래요
                </Typography>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
