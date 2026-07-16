import axios from 'axios';

const ACCESS_KEY = 'cam_dashboard_access';
const REFRESH_KEY = 'cam_dashboard_refresh';
const TENANT_KEY = 'cam_dashboard_tenant';

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredTenantId(): string | null {
  return localStorage.getItem(TENANT_KEY);
}

export function setAuthTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function setStoredTenantId(tenantId: string) {
  localStorage.setItem(TENANT_KEY, tenantId);
}

export function clearStoredTenantId() {
  localStorage.removeItem(TENANT_KEY);
}

const baseURL = `${import.meta.env.VITE_URL ?? '/'}api`;

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const tenantId = getStoredTenantId();
  if (tenantId) config.headers['X-Tenant-ID'] = tenantId;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getStoredRefreshToken();
  if (!refresh) return null;
  try {
    const response = await axios.post(`${baseURL}/user/token/refresh/`, { refresh });
    const access = response.data.access as string;
    localStorage.setItem(ACCESS_KEY, access);
    return access;
  } catch {
    clearAuthTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);
    original._retry = true;
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const access = await refreshPromise;
    if (!access) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${access}`;
    return apiClient(original);
  }
);
