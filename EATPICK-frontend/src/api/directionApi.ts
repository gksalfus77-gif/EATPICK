// ============================================================
// 파일: src/api/directionApi.ts
// 레이어: API / 역할: 백엔드 프록시를 통한 경로 데이터 수신
// ============================================================
import axios from 'axios';
import type { DirectionResponse } from '../types/direction';

// const apiClient = axios.create({ baseURL: '/api/v1' });

// 백엔드 응답 규격에 맞춘 타입 정의
export interface RouteResponse {
  route: {
    traoptimal: Array<{
      path: number[][]; // [lng, lat] 좌표 배열
      summary: {
        distance: number;
        duration: number;
      };
    }>;
  };
}

// API 클라이언트 설정 (중앙 집중식 관리)
const api = axios.create({
  baseURL: '/api/v1', // Spring Boot 백엔드 주소와 매칭
  headers: {
    'Content-Type': 'application/json',
  },
});

export const directionApi = {
  /**
   * 네이버 Directions 5 API 경로 데이터를 가져옵니다.
   * @param start 출발지 좌표 (lng,lat)
   * @param goal 목적지 좌표 (lng,lat)
   */
  getDrivingRoute: async (start: string, goal: string): Promise<DirectionResponse> => {
    try {
      const response = await api.get<DirectionResponse>('/map/directions', {
        params: { start, goal }
      });
      return response.data;
    } catch (error) {
      // 에러 핸들링 레이어
      console.error("Route API Error:", error);
      throw error;
    }
  }
};