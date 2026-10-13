import type { AuthResponse, User } from "../types/auth/types";

const JSON_HEADERS = new Headers({
  'Content-Type': 'application/json',
});

export async function fetchMe(signal?: AbortSignal): Promise<User | null> {
  const res = await fetch('/api/auth/me', {
    credentials: 'include',
    signal,
  });

  if (!res.ok) {
    if (res.status === 401) return null;
    throw new Error('Failed to fetch user');
  }

  return res.json();
}

export async function loginApi(
  credentials: { email: string; password: string },
  signal?: AbortSignal,
): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'include',
    signal,
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Login failed');

  return data;
}

export async function registerApi(
  credentials: { email: string; password: string },
  signal?: AbortSignal,
): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'include',
    signal,
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Registration failed');

  return data;
}

export async function logoutApi(signal?: AbortSignal): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    signal,
  });
}