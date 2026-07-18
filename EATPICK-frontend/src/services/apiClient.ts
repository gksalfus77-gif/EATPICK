import axios from 'axios';

/**
 * 1. Axios 인스턴스 생성
 * - baseURL: 환경 변수(VITE_API_BASE_URL)를 우선 사용하고, 없으면 기본 IP 주소를 사용합니다.
 * - withCredentials: 쿠키나 인증 정보를 포함하여 서버와 통신할 때 필수적인 설정입니다.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://43.203.165.206:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 2. 요청 인터셉터 (Request Interceptor)
 * - 모든 API 요청이 서버로 나가기 직전에 실행됩니다.
 * - localStorage에 저장된 'eatpick_access_token'을 찾아 헤더에 자동 주입합니다.
 * - 이를 통해 각 서비스 파일에서 매번 헤더를 작성할 필요가 없어집니다.
 */
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('eatpick_access_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    // 요청 과정에서의 에러 처리
    return Promise.reject(error);
  }
);

/**
 * 3. 응답 인터셉터 (Response Interceptor - 선택 사항)
 * - 서버로부터 오는 응답을 가로채서 공통 에러 처리를 할 수 있습니다.
 * - 예: 401 Unauthorized 발생 시 로그인 페이지로 이동시키는 등의 로직을 여기에 추가합니다.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("인증이 만료되었습니다. 다시 로그인해주세요.");
      // 필요 시: localStorage.removeItem('eatpick_access_token');
      // 필요 시: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;