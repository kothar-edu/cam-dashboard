import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { clearAuthTokens, clearStoredTenantId, getStoredAccessToken } from '@/api/client';
import { fetchMyProfile, login as loginRequest, type AuthUser } from '@/api/auth';

const ROLES_KEY = 'cam_dashboard_roles';
const TENANT_ADMIN_SCHEMAS_KEY = 'cam_dashboard_tenant_schemas';

type AuthContextValue = {
  user: AuthUser | null;
  roles: string[];
  loading: boolean;
  isAuthenticated: boolean;
  canManageTenants: boolean;
  tenantAdminSchemas: string[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredRoles(): string[] {
  const raw = localStorage.getItem(ROLES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function getStoredTenantAdminSchemas(): string[] {
  const raw = localStorage.getItem(TENANT_ADMIN_SCHEMAS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<string[]>(getStoredRoles());
  const [tenantAdminSchemas, setTenantAdminSchemas] = useState<string[]>(
    getStoredTenantAdminSchemas()
  );
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getStoredAccessToken()) {
      setUser(null);
      return;
    }
    const profile = await fetchMyProfile();
    setUser(profile);
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => {
        clearAuthTokens();
        localStorage.removeItem(ROLES_KEY);
        localStorage.removeItem(TENANT_ADMIN_SCHEMAS_KEY);
        setUser(null);
        setRoles([]);
        setTenantAdminSchemas([]);
      })
      .finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest(email.trim(), password);
      localStorage.setItem(ROLES_KEY, JSON.stringify(response.roles));
      localStorage.setItem(
        TENANT_ADMIN_SCHEMAS_KEY,
        JSON.stringify(response.tenant_admin_schemas ?? [])
      );
      setRoles(response.roles);
      setTenantAdminSchemas(response.tenant_admin_schemas ?? []);
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    clearAuthTokens();
    clearStoredTenantId();
    localStorage.removeItem(ROLES_KEY);
    localStorage.removeItem(TENANT_ADMIN_SCHEMAS_KEY);
    setUser(null);
    setRoles([]);
    setTenantAdminSchemas([]);
  }, []);

  const canManageTenants = Boolean(user?.is_staff || user?.is_superuser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      roles,
      loading,
      isAuthenticated: Boolean(user),
      canManageTenants,
      tenantAdminSchemas,
      login,
      logout,
      refreshUser,
    }),
    [user, roles, loading, canManageTenants, tenantAdminSchemas, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
