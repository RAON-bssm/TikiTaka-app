import { useEffect, useState } from 'react';

import { getSeenResultStageId, setSeenResultStageId } from '@/api/match';
import { useMatchResult } from './useMatchResult';
import { useMatchStage } from './useMatchStage';

/**
 * 라운드(stage)가 바뀌고 직전 라운드 결과가 있으면 "대결 종료" 팝업을 한 번 띄운다.
 * 서버에 읽음 여부가 없어, 마지막으로 확인한 stage_id를 기기에 저장해 재노출을 막는다.
 */
export function useMatchResultPopup() {
  const stage = useMatchStage();
  const result = useMatchResult();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stageId = stage.data?.stage_id;
    if (stageId == null || !result.data || result.data.match.length === 0) return;

    let cancelled = false;
    getSeenResultStageId().then((seenStageId) => {
      if (!cancelled && seenStageId !== stageId) {
        setVisible(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [stage.data?.stage_id, result.data]);

  const dismiss = () => {
    setVisible(false);
    if (stage.data) {
      void setSeenResultStageId(stage.data.stage_id);
    }
  };

  return { visible, stage: stage.data, dismiss };
}
