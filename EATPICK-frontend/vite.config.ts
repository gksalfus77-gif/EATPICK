import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
 server: {
    proxy: {
      // ✅ /api로 시작하는 모든 요청을 백엔드 서버(8080)로 보냅니다.
      '/api': {
        target:  "http://43.203.165.206:8080",
        // 'http://localhost:8080'
        changeOrigin: true,
        // 필요하다면 rewrite 설정 (백엔드 컨트롤러가 /api를 안 들고 있다면 사용)
        // rewrite: (path) => path.replace(/^\/api/, '') 
      }
    }
  }
})