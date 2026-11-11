import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { View } from 'react-native';

import { clearTutorialStep, getSavedTutorialStep, saveTutorialStep } from '@/api/tutorial';
import {
  isTutorialStepId,
  TUTORIAL_STEPS,
  type TutorialStepId,
  type TutorialTarget,
} from '@/constants/tutorial';
import { TutorialContext } from '@/hooks/tutorial/useTutorial';

export default function TutorialProvider({ children }: { children: ReactNode }) {
  const [stepId, setStepId] = useState<TutorialStepId | null>(null);
  const targets = useRef(new Map<TutorialTarget, View>());

  useEffect(() => {
    getSavedTutorialStep()
      .then((saved) => {
        if (!saved || !isTutorialStepId(saved)) return;
        // 미션 도중 앱이 꺼지면 카메라가 아니라 홈에서 다시 열리므로 카메라 안내부터 다시 보여준다.
        setStepId(saved === 'mission' ? 'camera' : saved);
      })
      .catch(() => {});
  }, []);

  const goTo = (id: TutorialStepId | null) => {
    setStepId(id);
    (id ? saveTutorialStep(id) : clearTutorialStep()).catch(() => {});
  };

  const next = () => {
    const index = TUTORIAL_STEPS.findIndex((s) => s.id === stepId);
    goTo(TUTORIAL_STEPS[index + 1]?.id ?? null);
  };

  const notifyPostUploaded = () => {
    if (stepId === 'mission') goTo('uploaded');
  };

  const registerTarget = (target: TutorialTarget, node: View | null) => {
    if (node) targets.current.set(target, node);
    else targets.current.delete(target);
  };

  const getTarget = (target: TutorialTarget) => targets.current.get(target);

  const step = TUTORIAL_STEPS.find((s) => s.id === stepId) ?? null;

  return (
    <TutorialContext
      value={{
        step,
        next,
        goTo,
        start: () => goTo(TUTORIAL_STEPS[0].id),
        notifyPostUploaded,
        registerTarget,
        getTarget,
      }}
    >
      {children}
    </TutorialContext>
  );
}
