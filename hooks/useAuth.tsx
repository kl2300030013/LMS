// src/hooks/useAuth.tsx
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// ---------------------- Types ----------------------
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor';
}

// ---------------------- Context ----------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------- Provider ----------------------
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    const user = localStorage.getItem('lms_user');

    if (token && user) {
      setAuthState({
        user: JSON.parse(user),
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // ---------------------- Functions ----------------------
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Gracefully handle non-JSON or error responses
      if (!response.ok) return false;

      const data = await response.json();

      if (data && data.success) {
        localStorage.setItem('lms_token', data.data.token);
        localStorage.setItem('lms_user', JSON.stringify(data.data.user));

        setAuthState({
          user: data.data.user,
          token: data.data.token,
          isLoading: false,
          isAuthenticated: true,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      // Gracefully handle non-JSON or error responses
      if (!response.ok) return false;

      const data = await response.json();

      if (data && data.success) {
        localStorage.setItem('lms_token', data.data.token);
        localStorage.setItem('lms_user', JSON.stringify(data.data.user));

        setAuthState({
          user: data.data.user,
          token: data.data.token,
          isLoading: false,
          isAuthenticated: true,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');

    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  // ---------------------- Render ----------------------
  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------- Custom Hook ----------------------
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
