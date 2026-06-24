import { Image, Pressable, View } from 'react-native';
import Typography from './Typography';

const AppVar = () => {
  return (
    <View>
      <Pressable>
        <Image
          source={require('@/assets/icons/app-var/home.svg')}
          style={{ width: 24, height: 24 }}
        />
        <Typography variant="caption">홈</Typography>
      </Pressable>
    </View>
  );
};

export default AppVar;
