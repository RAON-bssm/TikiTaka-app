import { Pressable } from 'react-native';
import Typography from './Typography';

type Size = 'md' | 'sm';
type Variant = 'primary' | 'light';

// 사이즈별 패딩과 텍스트 크기(Typography variant)
const sizeClass: Record<Size, string> = {
  md: 'p-md',
  sm: 'px-lg py-sm',
};

const sizeVariant: Record<Size, 'h3' | 'h4'> = {
  md: 'h3',
  sm: 'h4',
};

// 색상 조합(배경 + 글자색)
const variantClass: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-600', text: 'text-white' },
  light: { bg: 'bg-primary-100', text: 'text-primary-600' },
};

interface Props {
  content: string;
  onclick?: () => void;
  size?: Size;
  variant?: Variant;
  className?: string;
}

export default function Button({
  content,
  onclick,
  size = 'md',
  variant = 'primary',
  className = '',
}: Props) {
  const color = variantClass[variant];
  return (
    <Pressable
      onPress={onclick}
      className={`flex items-center justify-center rounded-sm ${color.bg} ${sizeClass[size]} ${className}`}
    >
      <Typography variant={sizeVariant[size]} className={color.text}>
        {content}
      </Typography>
    </Pressable>
  );
}
