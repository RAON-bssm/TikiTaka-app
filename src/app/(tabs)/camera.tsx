import FlipButton from '@/components/camera/FlipButton';
import MissionTitle from '@/components/camera/MissionTitle';
import ShutterButton from '@/components/camera/ShutterButton';
import ZoomControl, { type ZoomLevel } from '@/components/camera/ZoomControl';
import Typography from '@/components/ui/Typography';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [zoom, setZoom] = useState(0);
  const [selectedZoom, setSelectedZoom] = useState('1');

  const handleSelectZoom = (level: ZoomLevel) => {
    setSelectedZoom(level.label);
    setZoom(level.value);
  };

  const handleFlip = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo) {
      // TODO: 촬영 결과 미리보기/업로드 화면으로 연결
      console.log('captured:', photo.uri);
    }
  };

  // 권한 미결정 상태에서는 빈 화면 유지
  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  // 권한이 없으면 요청 안내
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-lg bg-black p-xl">
        <Typography variant="body1" className="text-center text-white">
          동네 사진을 촬영하려면 카메라 권한이 필요해요.
        </Typography>
        <Pressable onPress={requestPermission} className="rounded-full bg-primary-600 px-xl py-md">
          <Typography variant="h4" className="text-white">
            권한 허용하기
          </Typography>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {isFocused && (
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} zoom={zoom} />
      )}

      <MissionTitle title="예쁜 돌멩이 찾기" />

      <View
        className="absolute left-0 right-0 bottom-0 items-center gap-lg"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        <ZoomControl selected={selectedZoom} onSelect={handleSelectZoom} />

        <View className="w-full flex-row items-center justify-center">
          <ShutterButton onPress={handleCapture} />
          <View className="absolute right-3xl">
            <FlipButton onPress={handleFlip} />
          </View>
        </View>
      </View>
    </View>
  );
}
