import { Image } from 'react-native';

interface Props {
  uri: string;
}

export default function PostImage({ uri }: Props) {
  return (
    <Image
      source={{ uri }}
      style={{ width: '100%', height: 320 }}
      className="rounded-lg bg-gray-100"
    />
  );
}
