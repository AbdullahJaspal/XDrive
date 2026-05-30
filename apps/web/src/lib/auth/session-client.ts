'use client';

import { apiRequest } from '@/lib/api/client';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  status: string;
  operatorId: string | null;
  createdAt: string;
}

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function fetchProfile(): Promise<UserProfile | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return await apiRequest<UserProfile>('/users/me', { token });
  } catch {
    clearTokens();
    return null;
  }
}
