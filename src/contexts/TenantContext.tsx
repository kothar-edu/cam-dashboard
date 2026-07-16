import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearStoredTenantId,
  getStoredTenantId,
  setStoredTenantId,
} from '@/api/client';
import { listAccessibleTenants, type Tenant } from '@/api/tenants';
import { useAuth } from './AuthContext';

type TenantContextValue = {
  tenants: Tenant[];
  activeTenant: Tenant | null;
  activeTenantId: string | null;
  loading: boolean;
  setActiveTenantId: (schemaName: string) => void;
  refreshTenants: () => Promise<void>;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenantIdState] = useState<string | null>(
    getStoredTenantId()
  );
  const [loading, setLoading] = useState(false);

  const refreshTenants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAccessibleTenants();
      setTenants(data);
      const stored = getStoredTenantId();
      if (stored && data.some((tenant) => tenant.schema_name === stored)) {
        setActiveTenantIdState(stored);
      } else if (data.length === 1) {
        setActiveTenantIdState(data[0].schema_name);
        setStoredTenantId(data[0].schema_name);
      } else if (stored && !data.some((tenant) => tenant.schema_name === stored)) {
        clearStoredTenantId();
        setActiveTenantIdState(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshTenants().catch(() => setTenants([]));
    } else {
      setTenants([]);
      setActiveTenantIdState(null);
    }
  }, [isAuthenticated, refreshTenants]);

  const setActiveTenantId = useCallback((schemaName: string) => {
    setActiveTenantIdState(schemaName);
    setStoredTenantId(schemaName);
  }, []);

  const activeTenant = useMemo(
    () => tenants.find((tenant) => tenant.schema_name === activeTenantId) ?? null,
    [tenants, activeTenantId]
  );

  const value = useMemo(
    () => ({
      tenants,
      activeTenant,
      activeTenantId,
      loading,
      setActiveTenantId,
      refreshTenants,
    }),
    [tenants, activeTenant, activeTenantId, loading, setActiveTenantId, refreshTenants]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return ctx;
}
