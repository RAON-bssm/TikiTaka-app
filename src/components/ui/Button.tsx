import { Keyboard, Pressable } from 'react-native';
import Typography from './Typography';

type Size = 'md' | 'sm';
type Variant = 'primary' | 'light';

const sizeClass: Record<Size, string> = {
  md: 'p-md',
  sm: 'px-lg py-sm',
};

const sizeVariant: Record<Size, 'h3' | 'h4'> = {
  md: 'h3',
  sm: 'h4',
};

const variantClass: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-600', text: 'text-white' },
  light: { bg: 'bg-primary-100', text: 'text-primary-600' },
};

const DISABLED_CLASS = { bg: 'bg-gray-100', text: 'text-gray-400' };

interface Props {
  content: string;
  onclick?: () => void;
  size?: Size;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
}

export default function Button({
  content,
  onclick,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
}: Props) {
  const color = disabled ? DISABLED_CLASS : variantClass[variant];
  return (
    <Pressable
      onPress={() => {
        // 중복확인·제출처럼 입력을 마무리하는 버튼이 대부분이라, 눌린 뒤에도 키보드가 결과 토스트·문구를 가리지 않게 내린다.
        Keyboard.dismiss();
        onclick?.();
      }}
      disabled={disabled}
      className={`flex items-center justify-center rounded-sm ${color.bg} ${sizeClass[size]} ${className}`}
    >
      <Typography variant={sizeVariant[size]} className={color.text}>
        {content}
      </Typography>
    </Pressable>
  );
}
