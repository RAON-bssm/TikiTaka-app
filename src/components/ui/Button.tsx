import { Pressable } from 'react-native';
import Typography from './Typography';

interface Props {
  content: string;
  onclick?: () => void;
}

export default function Button({ content, onclick }: Props) {
  return (
    <Pressable
      onPress={onclick}
      className="flex items-center justify-center p-md rounded-sm bg-primary-600"
    >
      <Typography variant="body2" className="text-gray-50">
        {content}
      </Typography>
    </Pressable>
  );
}
