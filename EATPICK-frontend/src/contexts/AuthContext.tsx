// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService'; 

export type UserRole = 'USER' | 'EDITOR' | 'ADMIN';

export interface AuthUser {
  email: string;
  nickname: string;
  role: UserRole;
  isBanned: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBanned: boolean;
  isLoading: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginContext: (userData: AuthUser) => void;
  logoutContext: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isBanned: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  loginContext: () => {},
  logoutContext: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // 쿠키 기반이므로 로컬 스토리지에서 유저 데이터를 꺼낼 필요 없음
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyInfo = async () => {
    try {
      // 💡 토큰 인자 제거: apiClient가 쿠키를 자동으로 보냅니다.
      const data = await authService.getCurrentUser(); 
      setUser(data);
    } catch (err) {
      console.log("[AuthContext] 로그인 상태 아님 (정상)");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInfo();
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    setIsLoading(false); 
  };

  const logout = async () => {
    await authService.logout(); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      isBanned: user?.isBanned || false,
      isLoading, 
      login, 
      logout, 
      refreshUser: fetchMyInfo,
      loginContext: login,
      logoutContext: logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 반드시 AuthProvider 안에서 사용되어야 합니다.');
  }
  return context;
};