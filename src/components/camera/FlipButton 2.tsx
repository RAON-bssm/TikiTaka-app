import CameraFlipIcon from '@/assets/icons/camera-flip.svg';
import GlassCircle from '@/components/ui/GlassCircle';

interface Props {
  onPress: () => void;
}

/** 전면/후면 카메라 전환 버튼 (리퀴드글래스). */
export default function FlipButton({ onPress }: Props) {
  return (
    <GlassCircle size={50} onPress={onPress}>
      <CameraFlipIcon width={28} height={28} color="#F18358" />
    </GlassCircle>
  );
}
