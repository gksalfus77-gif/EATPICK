// ============================================================
// 파일: src/vite-env.d.ts
// 역할: 네이버 지도 전역 객체 타입 선언
// ============================================================
interface Window {
  naver: any;
}
// src/types/global.d.ts
export {};

declare global {
  interface Window {
    naver: any; // 네이버 지도 객체 정의
  }
}