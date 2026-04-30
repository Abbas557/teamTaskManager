import { User } from '../../types';

export function saveAuth(accessToken: string, user: User) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('accessToken'));
}
