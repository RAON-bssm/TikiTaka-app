/** GET /api/storage/view-url 응답 data */
export interface ViewUrlData {
  /** 이미지 표시용 조회 URL (유효 10분) */
  url: string;
}
