import PhotoEditor from '@/components/camera/PhotoEditor';
import { router, useLocalSearchParams } from 'expo-router';

export default function EditPhotoScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();

  return (
    <PhotoEditor
      uri={uri}
      onDone={(editedUri) =>
        router.push({ pathname: '/camera/upload', params: { uri: editedUri } })
      }
    />
  );
}
