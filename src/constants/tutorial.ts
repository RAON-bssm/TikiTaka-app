export type TutorialStepId =
  | 'welcome'
  | 'home'
  | 'ranking'
  | 'camera'
  | 'mission'
  | 'uploaded'
  | 'map'
  | 'market'
  | 'done';

/** AppBar 탭 라우트 이름 앞에 `tab:`을 붙인 키. AppBar가 같은 키로 위치를 등록한다. */
export type TutorialTarget = `tab:${'index' | 'ranking' | 'camera' | 'map' | 'market'}`;

/**
 * - talk: 화면을 어둡게 덮고 캐릭터가 설명한다. target이 있으면 그 아이콘만 밝게 뚫는다.
 * - camera: 카메라 아이콘을 눌러 촬영하러 가게 한다. 내 매치가 없으면 업로드가 불가능해 건너뛴다.
 * - mission: 화면을 덮지 않고 위에 말풍선만 띄워, 촬영→편집→업로드를 직접 하게 한다.
 */
export type TutorialStepKind = 'talk' | 'camera' | 'mission';

export interface TutorialStep {
  id: TutorialStepId;
  kind: TutorialStepKind;
  message: string;
  target?: TutorialTarget;
  cta?: string;
  noMatchMessage?: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    kind: 'talk',
    message: '안녕! 나는 앞으로 함께할 너의 캐릭터야.\n티키타카를 같이 둘러볼까?',
    cta: '좋아',
  },
  {
    id: 'home',
    kind: 'talk',
    target: 'tab:index',
    message: '홈에서는 우리 동네가 지금 어떤 동네와 대결하고 있는지 볼 수 있어.',
  },
  {
    id: 'ranking',
    kind: 'talk',
    target: 'tab:ranking',
    message: '랭킹에서는 동네 순위를 확인할 수 있어.',
  },
  {
    id: 'camera',
    kind: 'camera',
    target: 'tab:camera',
    message:
      '대결 주제에 맞는 사진을 올리면 우리 동네 점수가 올라가!\n카메라를 눌러 첫 사진을 찍어보자.',
    cta: '카메라 열기',
    noMatchMessage:
      '아직 참여 중인 대결이 없어서 지금은 사진을 올릴 수 없어.\n대결이 시작되면 카메라로 사진을 올려줘!',
  },
  {
    id: 'mission',
    kind: 'mission',
    message: '카메라를 눌러 주제에 맞는 사진을 찍어보자!',
  },
  {
    id: 'uploaded',
    kind: 'talk',
    message: '첫 사진 등록 완료!\n이렇게 사진을 올릴수록 우리 동네가 강해져.',
  },
  {
    id: 'map',
    kind: 'talk',
    target: 'tab:map',
    message: '지도에서는 동네 땅을 확인하고 다른 동네 땅에 도전할 수 있어.',
  },
  {
    id: 'market',
    kind: 'talk',
    target: 'tab:market',
    message: '활동으로 모은 포인트로 상점에서 나를 꾸밀 수 있어!',
  },
  {
    id: 'done',
    kind: 'talk',
    message: '이제 준비 끝!\n우리 동네를 1등으로 만들어보자.',
    cta: '시작하기',
  },
];

/** 미션 단계에서 지금 보고 있는 화면에 맞춰 바꿔 보여주는 안내. 키는 `usePathname()` 값. */
export const MISSION_MESSAGES: Record<string, string> = {
  '/camera': '주제에 맞는 장면을 찾아 셔터를 눌러봐!',
  '/camera/edit': '사진 각도를 맞추고 다음으로 넘어가자.',
  '/camera/upload': '한마디를 남기고 업로드하면 끝!',
};

export function isTutorialStepId(value: string): value is TutorialStepId {
  return TUTORIAL_STEPS.some((step) => step.id === value);
}
