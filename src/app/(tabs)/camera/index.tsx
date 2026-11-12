import CaptureView from '@/components/camera/CaptureView';
import { useMyBoard } from '@/hooks/post/useMyBoard';
import { router } from 'expo-router';

export default function CameraScreen() {
  const { data: myBoard } = useMyBoard();

  return (
    <CaptureView
      title={myBoard?.mission ?? ''}
      onCaptured={(uri) => router.push({ pathname: '/camera/edit', params: { uri } })}
    />
  );
}
