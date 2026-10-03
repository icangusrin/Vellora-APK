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
  private currentUserSubject = new BehaviorSubject<any>(
    this.getUserFromStorage()
  );

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.apiUrl}/auth/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getUser(): any {
    return this.getUserFromStorage();
  }
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


  logout() {
    const keysToRemove = [
      'token', 'user', 'userProfile', 'userName',
      'userEmail', 'userPhone', 'profileImage',
      'savedAddress', 'selectedProvince', 'selectedCity',
      'selectedDistrict', 'selectedPostalCode'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    this.currentUserSubject.next(null);
  }

  private getUserFromStorage(): any {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

}