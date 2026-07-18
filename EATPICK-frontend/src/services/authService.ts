import apiClient from './apiClient';

/**
 * Auth 관련 서비스
 * - apiClient(axios)의 withCredentials: true 설정과 
 * 인터셉터를 활용하여 쿠키 기반 인증을 수행합니다.
 */
export const authService = {
  // 1. 회원가입
  register: async (userData: any) => {
    const response = await apiClient.post('/api/member/register', userData);
    return response.data;
  },

  // 2. 로그인
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/api/member/login', credentials);
    // 로그인 성공 시 서버가 자동으로 'jwt' 쿠키를 구워줍니다.
    return response.data; 
  },

  // 3. 내 정보 조회 (쿠키 자동 전송)
  // 인자가 필요 없습니다. 브라우저가 알아서 쿠키를 들고 갑니다.
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/member/me');
    return response.data;
  },

  // 4. 로그아웃
  logout: async () => {
    // 서버에 쿠키 삭제 요청
    await apiClient.post('/api/member/logout');
    // 혹시 모를 토큰 잔여물 삭제 (필요 시)
    localStorage.removeItem('eatpick_access_token');
  }
};