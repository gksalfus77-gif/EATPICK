import apiClient from './apiClient';

export const notificationService = {
  // 내 알림 목록 조회
  getMyNotifications: async () => {
    const response = await apiClient.get('/api/notifications');
    return response.data;
  },
  // 알림 읽음 처리
  markAsRead: async (id: bigint) => {
    return await apiClient.patch(`/api/notifications/${id}/read`);
  }
};