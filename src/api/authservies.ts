// Use env var in production, fallback to localhost in development
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:3000/api/auth';

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), // Use 'email' key, not 'email1'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Login failed');
  }

  const token: string | undefined = data?.token;
  if (!token) {
    throw new Error('Login failed: token missing');
  }

  // Persist token for authenticated API calls
  localStorage.setItem('token', token);

  return token;
}
