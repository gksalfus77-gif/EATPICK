import { RouterProvider } from 'react-router-dom'
import router from '../src/Routers/Router' 
import { AuthProvider } from './contexts/AuthContext';
// ✅ 이렇게 되어 있어야 해요
export type PageType = 'home' | 'map' | 'blog'

function App() {
  // ✅ 더 이상 useState로 페이지를 관리하지 않습니다. 
  // URL 주소에 따라 라우터가 알아서 페이지를 보여줍니다.
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;








