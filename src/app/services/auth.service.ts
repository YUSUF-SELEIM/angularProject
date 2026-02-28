import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  username: string;
  role: UserRole;
}

const MOCK_USERS: (AuthUser & { password: string })[] = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentUser = signal<AuthUser | null>(
    JSON.parse(sessionStorage.getItem('auth_user') ?? 'null'),
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly role = computed(() => this._currentUser()?.role ?? null);

  login(username: string, password: string): boolean {
    const match = MOCK_USERS.find((u) => u.username === username && u.password === password);
    if (!match) return false;

    const user: AuthUser = { username: match.username, role: match.role };
    this._currentUser.set(user);
    sessionStorage.setItem('auth_user', JSON.stringify(user));
    return true;
  }

  logout(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem('auth_user');
  }
}
