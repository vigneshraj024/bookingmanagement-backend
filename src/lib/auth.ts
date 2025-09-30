import { apiFetch, getAuthToken, setAuthToken } from './api';
import { Admin } from '@/types/booking';

type JwtPayload = { sub?: string; email?: string; name?: string; exp?: number };

function parseJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const authService = {
  async signIn(email: string, password: string) {
    try {
      const { token } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(token);
      return { data: { token }, error: null } as const;
    } catch (e: any) {
      return { data: null, error: e } as const;
    }
  },

  async signOut() {
    const token = getAuthToken();
    if (token) {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST' });
      } catch {
        // ignore network failures on logout
      }
    }
    setAuthToken(null);
    return { error: null };
  },

  async getCurrentUser(): Promise<Admin | null> {
    const payload = parseJwt(getAuthToken());
    if (!payload?.sub || !payload.email) return null;
    return {
      id: String(payload.sub),
      name: payload.name || payload.email.split('@')[0] || 'Admin',
      email: payload.email,
    };
  },

  onAuthStateChange(callback: (user: Admin | null) => void) {
    const handler = async () => {
      const user = await this.getCurrentUser();
      callback(user);
    };
    window.addEventListener('auth:token-changed', handler);
    // fire once immediately
    handler();
    return {
      data: null,
      error: null,
      unsubscribe: () => window.removeEventListener('auth:token-changed', handler),
    } as const;
  },
};