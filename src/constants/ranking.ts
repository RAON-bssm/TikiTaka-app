/** 팀랭킹은 땅따먹기 사이클 중에만 보인다. */
export const RANKING_TABS = ['동네랭킹', '개인랭킹', '팀랭킹'] as const;
export type RankingTab = (typeof RANKING_TABS)[number];
