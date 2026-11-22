import { useState } from 'react';
import { Linking, Modal, View } from 'react-native';

import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/feedback/ConfirmDialog';
import Typography from '@/components/ui/Typography';
import type { AppVersionData } from '@/types/appVersion';

interface Props {
  versionCheck: AppVersionData | undefined;
  /** 다른 모달이 떠 있는 동안 false. iOS는 모달 두 개를 동시에 띄우지 못해 뒤의 것이 안 보인다. */
  enabled: boolean;
}

export default function AppUpdateDialog({ versionCheck, enabled }: Props) {
  const [isDismissed, setIsDismissed] = useState(false);

  // 서버가 store_url 없이 업데이트를 요구하면 이동할 곳이 없어, 강제 업데이트라도 앱을 막지 않는다.
  const storeUrl = versionCheck?.store_url;
  if (!enabled || !storeUrl || !versionCheck || versionCheck.update_type === 'NONE') return null;

  const openStore = () => {
    Linking.openURL(storeUrl).catch(() => {});
  };

  if (versionCheck.update_type === 'OPTIONAL') {
    return (
      <ConfirmDialog
        visible={!isDismissed}
        title="새 버전이 나왔어요"
        description="업데이트하고 더 나아진 티키타카를 만나보세요."
        confirmLabel="업데이트"
        cancelLabel="나중에"
        onConfirm={() => {
          setIsDismissed(true);
          openStore();
        }}
        onCancel={() => setIsDismissed(true)}
      />
    );
  }

  // 스토어에 다녀와도 업데이트하지 않았다면 그대로 막아야 해서 닫는 수단(뒤로 가기 포함)을 두지 않는다.
  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-[300px] gap-2xl rounded-xl bg-white px-xl pb-xl pt-2xl">
          <View className="items-center gap-sm">
            <Typography variant="h2" className="text-center text-gray-800">
              업데이트가 필요해요
            </Typography>
            <Typography variant="body2" className="text-center text-gray-500">
              지금 버전은 더 이상 지원하지 않아요.{'\n'}최신 버전으로 업데이트해 주세요.
            </Typography>
          </View>
          <Button content="업데이트" onclick={openStore} />
        </View>
      </View>
    </Modal>
  );
}
