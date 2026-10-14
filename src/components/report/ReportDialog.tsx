import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getApiErrorMessage } from '@/api/error';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Typography from '@/components/ui/Typography';
import { palette } from '@/constants/colors';
import {
  POST_REPORT_REASONS,
  REPORT_DETAIL_MAX_LENGTH,
  REPORT_REASON_LABEL,
  USER_REPORT_REASONS,
} from '@/constants/report';
import { useReportPost } from '@/hooks/report/useReportPost';
import { useReportUser } from '@/hooks/report/useReportUser';
import type { ReportReason, UserReportReason } from '@/types/report';

export type ReportTarget =
  | { type: 'post'; postId: string }
  | { type: 'user'; userId: string; userName: string };

interface Props {
  target?: ReportTarget;
  onClose: () => void;
}

export default function ReportDialog({ target, onClose }: Props) {
  const { mutate: reportPost, isPending: isPostPending } = useReportPost();
  const { mutate: reportUser, isPending: isUserPending } = useReportUser();
  const isPending = isPostPending || isUserPending;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  return (
    <Modal
      visible={!!target}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* 열 때마다 선택한 사유와 입력값을 비우려고 key로 폼을 새로 마운트한다. */}
      {target && (
        <ReportForm
          key={target.type === 'post' ? target.postId : target.userId}
          target={target}
          isPending={isPending}
          reportPost={reportPost}
          reportUser={reportUser}
          onClose={handleClose}
          onSuccess={onClose}
        />
      )}
    </Modal>
  );
}

const isUserReportReason = (reason: ReportReason): reason is UserReportReason =>
  reason !== 'FAKE_MISSION';

interface FormProps {
  target: ReportTarget;
  isPending: boolean;
  reportPost: ReturnType<typeof useReportPost>['mutate'];
  reportUser: ReturnType<typeof useReportUser>['mutate'];
  onClose: () => void;
  onSuccess: () => void;
}

const ReportForm = ({
  target,
  isPending,
  reportPost,
  reportUser,
  onClose,
  onSuccess,
}: FormProps) => {
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [reason, setReason] = useState<ReportReason>();
  const [detail, setDetail] = useState('');
  // 토스트는 모달 아래에 깔려 보이지 않으므로 실패 사유는 창 안에 띄운다.
  const [errorMessage, setErrorMessage] = useState<string>();
  const submittingRef = useRef(false);

  const reasons = target.type === 'post' ? POST_REPORT_REASONS : USER_REPORT_REASONS;
  const trimmedDetail = detail.trim();
  const isDetailRequired = reason === 'OTHER';
  const canSubmit = !isPending && !!reason && (!isDetailRequired || trimmedDetail !== '');

  const handleSubmit = () => {
    if (submittingRef.current || !canSubmit || !reason) return;

    submittingRef.current = true;
    setErrorMessage(undefined);
    const options = {
      onSuccess: () => {
        onSuccess();
        showToast('신고가 접수되었어요');
      },
      onError: (error: unknown) => {
        submittingRef.current = false;
        setErrorMessage(getApiErrorMessage(error, '신고하지 못했어요'));
      },
    };
    const detailField = trimmedDetail ? { detail: trimmedDetail } : {};

    if (target.type === 'post') {
      reportPost({ postId: target.postId, req: { reason, ...detailField } }, options);
    } else if (isUserReportReason(reason)) {
      reportUser({ userId: target.userId, req: { reason, ...detailField } }, options);
    } else {
      submittingRef.current = false;
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-xl"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          className="max-h-full w-full max-w-[400px] rounded-xl bg-white"
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-2xl px-xl pb-xl pt-2xl"
          >
            <View className="items-center gap-sm">
              <Typography variant="h2" className="text-gray-800">
                {target.type === 'post' ? '게시글 신고' : `${target.userName}님 신고`}
              </Typography>
              <Typography variant="body2" className="text-center text-gray-500">
                신고 사유를 골라주세요.
              </Typography>
            </View>

            <View className="gap-xs">
              {reasons.map((item) => {
                const selected = item === reason;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setReason(item)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    className="flex-row items-center gap-sm py-sm"
                  >
                    <View
                      className={`h-[20px] w-[20px] items-center justify-center rounded-full border-2 ${
                        selected ? 'border-primary-600' : 'border-gray-300'
                      }`}
                    >
                      {selected && (
                        <View className="h-[10px] w-[10px] rounded-full bg-primary-600" />
                      )}
                    </View>
                    <Typography
                      variant="body2"
                      className={selected ? 'text-gray-800' : 'text-gray-600'}
                    >
                      {REPORT_REASON_LABEL[item]}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <View className="gap-xs">
              <TextInput
                value={detail}
                onChangeText={setDetail}
                multiline
                maxLength={REPORT_DETAIL_MAX_LENGTH}
                textAlignVertical="top"
                placeholder={
                  isDetailRequired ? '신고 사유를 적어주세요' : '자세한 내용을 적어주세요 (선택)'
                }
                placeholderTextColor={palette.gray[400]}
                className="h-[88px] w-full rounded-sm border border-gray-200 bg-white p-md font-sans text-sm text-gray-800 focus:border-gray-300"
              />
              <View className="flex-row justify-between gap-sm">
                <Typography variant="caption" className="flex-1 text-primary-600">
                  {errorMessage ?? ''}
                </Typography>
                <Typography variant="caption" className="text-gray-400">
                  {detail.length}/{REPORT_DETAIL_MAX_LENGTH}
                </Typography>
              </View>
            </View>

            <View className="flex-row gap-sm">
              <Button content="취소" variant="light" className="flex-1" onclick={onClose} />
              <Button
                content={isPending ? '신고 중...' : '신고하기'}
                className={`flex-1 ${canSubmit ? '' : 'opacity-50'}`}
                onclick={handleSubmit}
              />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </KeyboardAvoidingView>
  );
};
