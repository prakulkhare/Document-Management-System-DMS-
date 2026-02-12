import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

interface AuthResponse {
  token: string;
  user: { _id: string; email: string; role: 'user' | 'admin' };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'dms_token';
  private userKey = 'dms_user';
  private authStateSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('dms_token'));
  authState$: Observable<boolean> = this.authStateSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          this.authStateSubject.next(true);
        })
      );
  }

  register(name: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
      name,
      email,
      password
    });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authStateSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser() {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }

  getUserId(): string | null {
    const user = this.getUser();
    return user?._id || null;
  }

  
  syncAuthState() {
    this.authStateSubject.next(!!localStorage.getItem(this.tokenKey));
  }
}

