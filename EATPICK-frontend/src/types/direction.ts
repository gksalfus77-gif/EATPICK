// ============================================================
// 파일: src/types/direction.ts
// 레이어: Types / 역할: 경로 좌표 및 응답 구조 정의
// ============================================================
export interface RouteSection {
  path: [number, number][]; // [longitude, latitude] 배열
  distance: number;
  duration: number;
}

export interface DirectionResponse {
  route: {
    traoptimal: Array<{
      path: number[][]; // [lng, lat]
      summary: { distance: number; duration: number; };
    }>;
  };
}