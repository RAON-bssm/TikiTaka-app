import { Text, TextProps } from 'react-native';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'body3' | 'caption';

const variantClass: Record<Variant, string> = {
  display: 'text-2xl font-bold',
  h1: 'text-xl font-bold',
  h2: 'text-lg font-bold',
  h3: 'text-md font-bold',
  h4: 'text-sm font-bold',
  body1: 'text-md font-sans',
  body2: 'text-sm font-sans',
  body3: 'text-xs font-sans',
  caption: 'text-xs font-regular',
};

interface Props extends TextProps {
  variant?: Variant;
}

export default function Typography({ variant = 'body1', className, ...props }: Props) {
  return <Text className={`${variantClass[variant]} ${className ?? ''}`} {...props} />;
}
