import apiClient from './apiClient'; // 공통 apiClient만 남겨두고 중복 선언 제거


// 백엔드 응답 데이터 구조에서 통계 리스트를 안전하게 추출하는 헬퍼 함수


export const trafficStatsService = {
  
 
  /**
   * 3. 수동 배치 실행 (관리자용)
   * POST /api/admin/traffic-stats/run?date={date}
   */
  runManualBatch: async (date?: string): Promise<string> => {
    try {
      const response = await apiClient.post<string>('/api/admin/traffic-stats/run', null, {
        params: date ? { date } : {},
      });
      return response.data; // 백엔드에서 리턴하는 "집계 완료" 메시지 문자열
    } catch (error) {
      console.error("수동 배치 실행 실패:", error);
      throw error; // 배치가 실패했음을 UI(컴포넌트) 단에 알려주기 위해 예외를 던짐
    }
  },
  getAllStats: async (page = 0, size = 10) => {
    const res = await apiClient.get('/api/admin/traffic-stats/all', { params: { page, size } });
    return res.data; // { content: [...], totalPages: 5 } 형태의 Page 객체가 반환됨
  },

  // 2. 날짜별 전체 조회 (대시보드 순위용 - 사이즈 넉넉하게 100개 지정)
  getAllStatsByDate: async (date: string, page = 0, size = 100) => {
    const res = await apiClient.get('/api/admin/traffic-stats/date', { params: { date, page, size } });
    return res.data; // 🌟 중요: 이젠 res.data.content 형태로 맵핑이 필요하게 됨
  }
};