import { View } from 'react-native';

import { getApiErrorMessage } from '@/api/error';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/input/TextInput';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { useCheckUserName } from '@/hooks/auth/useCheckUserName';

/** 확인 후 닉네임을 고치면 결과가 무효가 되도록, 어떤 닉네임에 대한 결과인지 함께 둔다. */
export interface NameCheck {
  name: string;
  available: boolean;
}

/**
 * 제출을 막아야 하면 그 사유를, 지금 입력값이 중복확인을 통과했으면 undefined를 준다.
 * 통과해도 제출 시 409는 따로 처리해야 한다(확인과 제출 사이에 선점될 수 있다).
 */
export function getNameCheckError(check: NameCheck | undefined, value: string) {
  if (check?.name !== value.trim()) return '닉네임 중복확인을 해주세요';
  if (!check.available) return '이미 사용 중인 닉네임이에요';
  return undefined;
}

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  check?: NameCheck;
  onCheck: (check: NameCheck) => void;
  /** 프로필 수정처럼 이미 내 닉네임이 있으면 넘긴다. 서버는 내 닉네임도 "사용 중"으로 답한다. */
  currentName?: string;
}

export default function NicknameField({ value, onChangeText, check, onCheck, currentName }: Props) {
  const { showToast } = useToast();
  const { mutate: checkName, isPending } = useCheckUserName();

  const trimmedName = value.trim();
  const currentCheck = check?.name === trimmedName ? check : undefined;

  const handleCheck = () => {
    if (isPending) return;
    if (!trimmedName) {
      showToast('닉네임을 입력해주세요');
      return;
    }
    if (trimmedName === currentName) {
      showToast('지금 쓰고 있는 닉네임이에요');
      return;
    }

    checkName(trimmedName, {
      onSuccess: (available) => onCheck({ name: trimmedName, available }),
      onError: (error) => showToast(getApiErrorMessage(error, '중복확인에 실패했어요')),
    });
  };

  return (
    <View className="flex flex-col gap-xs w-full">
      <View className="flex flex-row gap-sm items-end w-full">
        <View className="flex-1">
          <TextInput
            label="닉네임"
            placeholder="닉네임을 입력해주세요"
            value={value}
            onChangeText={onChangeText}
          />
        </View>
        <Button
          content="중복확인"
          onclick={handleCheck}
          className={isPending ? 'opacity-50' : ''}
        />
      </View>
      {currentCheck ? (
        <Typography
          variant="caption"
          className={currentCheck.available ? 'text-secondary-500' : 'text-primary-600'}
        >
          {currentCheck.available ? '사용 가능한 닉네임이에요' : '이미 사용 중인 닉네임이에요'}
        </Typography>
      ) : null}
    </View>
  );
}
