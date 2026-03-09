import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, of, switchMap, tap } from 'rxjs';

export type UserRole = 'admin' | 'user' | 'seller';

export interface AuthUser {
  username: string;
  role: UserRole;
}

const API_BASE = 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _currentUser = signal<AuthUser | null>(
    JSON.parse(sessionStorage.getItem(USER_KEY) ?? 'null'),
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly role = computed(() => this._currentUser()?.role ?? null);

  register(name: string, email: string, password: string) {
    return this.http.post<any>(`${API_BASE}/auth/register`, { name, email, password }).pipe(
      map((res) => res?.data?.token as string | undefined),
      switchMap((token) => {
        if (!token) return of({ ok: false, message: 'Invalid server response.' });

        return this.establishSessionFromToken(token, email).pipe(
          map((ok) => ({ ok, message: ok ? undefined : 'Registration failed.' })),
        );
      }),
      catchError((err) => {
        const message = err?.error?.data?.message ?? err?.error?.message ?? 'Registration failed.';
        return of({ ok: false, message });
      }),
    );
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${API_BASE}/auth/login`, { email, password }).pipe(
      map((res) => res?.data?.token as string | undefined),
      switchMap((token) => {
        if (!token) return of(false);

        return this.establishSessionFromToken(token, email);
      }),
      tap((ok) => {
        if (!ok) {
          this._currentUser.set(null);
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
        }
      }),
      catchError(() => of(false)),
    );
  }

  logout(): void {
    this._currentUser.set(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  private establishSessionFromToken(token: string, email: string) {
    sessionStorage.setItem(TOKEN_KEY, token);

    return this.http
      .get<any>(`${API_BASE}/profile/me`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .pipe(
        map((profileRes) => {
          const data = profileRes?.data ?? profileRes ?? {};
          const role = this.normalizeRole(data?.role ?? data?.userType ?? data?.type);
          const username = data?.name ?? data?.username ?? data?.email ?? email;
          const user: AuthUser = { username, role };

          this._currentUser.set(user);
          sessionStorage.setItem(USER_KEY, JSON.stringify(user));
          return true;
        }),
        catchError(() => {
          const fallbackUser: AuthUser = { username: email, role: 'user' };
          this._currentUser.set(fallbackUser);
          sessionStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
          return of(true);
        }),
      );
  }

  private normalizeRole(role: string | undefined): UserRole {
    if (role === 'admin') return 'admin';
    if (role === 'seller') return 'seller';
    return 'user';
  }
}
