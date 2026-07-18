import apiClient from './apiClient';

export const adminService = {
  // 사이트 설정 수정
  updateConfig: async (configData: any) => {
    return await apiClient.put('/api/admin/configs', configData);
  },
  // 관리 로그 조회 (페이지네이션)
  getLogs: async (page = 0, size = 20) => {
    const response = await apiClient.get('/api/admin/logs', { params: { page, size } });
    return response.data;
  }
};