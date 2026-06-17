import { Pressable } from 'react-native';
import Typography from './Typography';

interface Props {
  content: string;
  onclick?: () => void;
}

const Button = ({ content, onclick }: Props) => {
  return (
    <Pressable
      onPress={onclick}
      className="flex items-center justify-center w-full p-md rounded-sm bg-primary-600"
    >
      <Typography variant="body2" className="text-gray-50">
        {content}
      </Typography>
    </Pressable>
  );
};
export default Button;
