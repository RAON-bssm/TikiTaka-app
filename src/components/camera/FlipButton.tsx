import CameraFlipIcon from '@/assets/icons/camera-flip.svg';
import GlassCircle from '@/components/ui/GlassCircle';

interface Props {
  onPress: () => void;
}

export default function FlipButton({ onPress }: Props) {
  return (
    <GlassCircle size={50} onPress={onPress}>
      <CameraFlipIcon width={28} height={28} color="#F18358" />
    </GlassCircle>
  );
}
