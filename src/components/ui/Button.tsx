import { Pressable } from 'react-native';
import Typography from './Typography';

type Size = 'md' | 'sm';

// 사이즈별 패딩과 텍스트 크기(Typography variant)
const sizeClass: Record<Size, string> = {
  md: 'p-md',
  sm: 'px-lg py-sm',
};

const sizeVariant: Record<Size, 'h3' | 'h4'> = {
  md: 'h3',
  sm: 'h4',
};

interface Props {
  content: string;
  onclick?: () => void;
  size?: Size;
}

export default function Button({ content, onclick, size = 'md' }: Props) {
  return (
    <Pressable
      onPress={onclick}
      className={`flex items-center justify-center rounded-sm bg-primary-600 ${sizeClass[size]}`}
    >
      <Typography variant={sizeVariant[size]} className="text-gray-50">
        {content}
      </Typography>
    </Pressable>
  );
}
