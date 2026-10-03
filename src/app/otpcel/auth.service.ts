import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private apiUrl = environment.apiUrl;

  // BehaviorSubject agar komponen lain bisa subscribe perubahan user
  // (dibutuhkan untuk fix Bug #4 — profile refresh setelah join seller)
  private currentUserSubject = new BehaviorSubject<any>(
    this.getUserFromStorage()
  );

  // Observable publik yang bisa di-subscribe
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ─── AUTH ──────────────────────────────────────────────────────────────────

  login(data: any) {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  // ─── TOKEN ─────────────────────────────────────────────────────────────────

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ─── USER STATE ────────────────────────────────────────────────────────────

  /** Simpan data user ke localStorage DAN update BehaviorSubject */
  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /** Ambil user dari localStorage (sinkron) */
  getUser(): any {
    return this.getUserFromStorage();
  }

  /** Refresh data user dari API + update state (Fix Bug #4, #17) */
  refreshUser(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.apiUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap((res: any) => {
        if (res?.data) {
          this.saveUser(res.data);
        }
      })
    );
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────

  logout() {
    const keysToRemove = [
      'token', 'user', 'userProfile', 'userName',
      'userEmail', 'userPhone', 'profileImage',
      'savedAddress', 'selectedProvince', 'selectedCity',
      'selectedDistrict', 'selectedPostalCode'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Reset BehaviorSubject saat logout
    this.currentUserSubject.next(null);
  }

  // ─── PRIVATE ───────────────────────────────────────────────────────────────

  private getUserFromStorage(): any {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

}