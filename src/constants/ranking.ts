export const RANKING_TABS = ['동네랭킹', '개인랭킹'] as const;
export type RankingTab = (typeof RANKING_TABS)[number];
