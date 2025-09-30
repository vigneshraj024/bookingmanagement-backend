const EXPLICIT = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const DEV = import.meta.env.VITE_API_URL_DEV?.replace(/\/$/, '');
const PROD = import.meta.env.VITE_API_URL_PROD?.replace(/\/$/, '');

function resolveBaseUrl(): string {
  // If VITE_API_URL is set, it wins (useful for staging/preview overrides)
  if (EXPLICIT) return EXPLICIT;

  try {
    const host = window.location.hostname;
    // Local dev: localhost or 127.0.0.1
    if (/^(localhost|127\.0\.0\.1)$/i.test(host)) {
      return DEV || PROD || '';
    }
    // Otherwise assume production URL
    return PROD || DEV || '';
  } catch {
    return PROD || DEV || '';
  }
}

const BASE_URL = resolveBaseUrl();

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    // Notify listeners (e.g., auth state subscribers)
    window.dispatchEvent(new CustomEvent('auth:token-changed'));
  } catch {}
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  // Try to parse JSON; fallback to text
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text as any;
  }
}
