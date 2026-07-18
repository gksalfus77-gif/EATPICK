/**
 * 게시판별 단일 날짜 통계 DTO
 */
export interface TrafficStatsDto {
  boardName: string;      // 게시판 이름
  keyword: string;        // 키워드
  mentionCount: number;   // 언급 횟수 (Long을 number로 변환)
  statDate: string;       // 통계 날짜 (API 응답 시 문자열로 변환됨)
}

/**
 * 게시판별 기간별 통계 DTO
 * (테이블에 없는 정보인 startDate, endDate가 포함된 형태)
 */
export interface TrafficStatsResponseDto {
  boardName: string;
  keyword: string;
  mentionCount: number;
  startDate: string;      // 시작 날짜
  endDate: string;        // 종료 날짜
}