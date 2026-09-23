import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/task.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'taskboard_auth_token';
  private readonly USER_KEY = 'taskboard_auth_user';

  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = signal<boolean>(!!this.getToken());

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
          this.currentUser.set(res.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
