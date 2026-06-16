import { Image, Pressable, View } from 'react-native';
import Typography from './Typography';

const BackButton = () => {
  return (
    <View className="flex flex-row">
      <Pressable>
        <Image
          source={require('@/assets/icons/chevron-left.svg')}
          style={{ width: 24, height: 24, resizeMode: 'contain' }}
        />
      </Pressable>
      <Typography variant="h3" className="text-gray-600">
        정보등록
      </Typography>
    </View>
  );
};
export default BackButton;
