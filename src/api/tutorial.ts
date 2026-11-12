import * as SecureStore from 'expo-secure-store';

import { TUTORIAL_STEPS, type TutorialStepId } from '@/constants/tutorial';

const TUTORIAL_STEP_KEY = 'tutorialStep';

// 진행 중인 단계를 저장해 두고 마치면 지운다. 앱을 껐다 켜도 그 단계부터 이어서 보여준다.
// 기기 단위 키라 로그아웃 때 지운다. 남겨두면 다음에 로그인한 계정에 튜토리얼이 뜬다.
export const getSavedTutorialStep = () => SecureStore.getItemAsync(TUTORIAL_STEP_KEY);

export const saveTutorialStep = (stepId: TutorialStepId) =>
  SecureStore.setItemAsync(TUTORIAL_STEP_KEY, stepId);

export const clearTutorialStep = () => SecureStore.deleteItemAsync(TUTORIAL_STEP_KEY);

/** 가입 직후에만 부른다. 기존 사용자는 이 값이 없어 튜토리얼이 자동으로 뜨지 않는다. */
export const startTutorialForNewUser = () => saveTutorialStep(TUTORIAL_STEPS[0].id);
