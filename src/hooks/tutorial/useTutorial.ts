import { createContext, use } from 'react';
import type { View } from 'react-native';

import type { TutorialStep, TutorialStepId, TutorialTarget } from '@/constants/tutorial';

export interface TutorialContextValue {
  step: TutorialStep | null;
  next: () => void;
  goTo: (id: TutorialStepId | null) => void;
  start: () => void;
  notifyPostUploaded: () => void;
  registerTarget: (target: TutorialTarget, node: View | null) => void;
  getTarget: (target: TutorialTarget) => View | undefined;
}

export const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const value = use(TutorialContext);
  if (!value) throw new Error('useTutorial은 TutorialProvider 안에서만 쓸 수 있어요.');
  return value;
}
