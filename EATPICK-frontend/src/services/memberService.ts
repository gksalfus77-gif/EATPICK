import apiClient from './apiClient';

export const memberService = {
  // --- 기존 인증 관련 ---
  register: async (data: any) => await apiClient.post('/api/member/register', data),
  login: async (credentials: any) => await apiClient.post('/api/member/login', credentials),
  getCurrentUser: async () => await apiClient.get('/api/member/me'),
  logout: async () => await apiClient.post('/api/member/logout'),

  // --- 회원 관리 관련 ---
  
  // 전체 회원 목록 조회
  getMemberList: async (page = 0, size = 10) => {
    const response = await apiClient.get(`/api/member`, {
      params: { page, size }
    });
    return response.data;
  },

  // 특정 회원 상세 조회
  getMemberDetail: async (email: string) => {
    const response = await apiClient.get(`/api/member/${email}`);
    return response.data;
  },

  updateMemberStatus: async (email: string, isSuspend: boolean) => {
    // 쿼리 파라미터 방식을 사용하여 깔끔하게 전달
    return await apiClient.patch(`/api/member/${email}/status`, null, {
      params: { isSuspend }
    });
  },
  updateStatus: async (email: string, isSuspend: boolean): Promise<boolean> => {
    try {
      // 💡 백엔드 API 엔드포인트 주소에 맞게 '/api/members...' 부분을 수정해서 사용하세요!
      const response = await apiClient.put(`/api/members/${email}/status`, { isSuspend });
      return response.status === 200;
    } catch (error) {
      console.error(`회원 상태 업데이트 실패 (${email}):`, error);
      throw error;
    }
  },
};