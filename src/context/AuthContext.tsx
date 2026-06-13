import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { useAppStore } from '../store';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (requiredRole: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const roleHierarchy: Record<UserRole, number> = {
  national: 5,
  provincial: 4,
  municipal: 3,
  district: 2,
  property: 1,
};

export const mockUsers: Record<UserRole, User> = {
  national: {
    id: 'user-national',
    name: '国家住建部管理员',
    role: 'national',
    regionId: 'national',
    regionName: '全国',
  },
  provincial: {
    id: 'user-provincial',
    name: '广东省住建厅管理员',
    role: 'provincial',
    regionId: '440000',
    regionName: '广东省',
  },
  municipal: {
    id: 'user-municipal',
    name: '北京市住建局管理员',
    role: 'municipal',
    regionId: '110100',
    regionName: '北京市',
  },
  district: {
    id: 'user-district',
    name: '朝阳区住房保障中心',
    role: 'district',
    regionId: '110105',
    regionName: '朝阳区',
  },
  property: {
    id: 'user-property',
    name: '阳光家园物业',
    role: 'property',
    regionId: 'community-1',
    regionName: '阳光家园',
  },
};

interface AuthProviderProps {
  children: ReactNode;
}

function getInitialUser(): User {
  const storedRole = useAppStore.getState().currentRole;
  if (storedRole && mockUsers[storedRole]) {
    return mockUsers[storedRole];
  }
  return mockUsers.municipal;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const setCurrentRole = useAppStore((state) => state.setCurrentRole);
  const storedRole = useAppStore((state) => state.currentRole);

  useEffect(() => {
    if (storedRole && mockUsers[storedRole] && user?.role !== storedRole) {
      setUser(mockUsers[storedRole]);
    }
  }, [storedRole, user?.role]);

  const login = (role: UserRole) => {
    setUser(mockUsers[role]);
    setCurrentRole(role);
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.some(role => roleHierarchy[user.role] >= roleHierarchy[role]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
