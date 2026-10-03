import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet, IonButton, IonIcon } from '@ionic/angular/standalone';
import { SplashScreenComponent } from './shared/components/splash-screen/splash-screen.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';

try {
  initializeApp(environment.firebaseConfig);
} catch (e) {
  console.warn('[Firebase] Gagal inisialisasi:', e);
}

const AUTH_STORAGE_KEYS = [
  'token',
  'user',
  'selectedVoucher',
  'checkoutItems',
  'checkoutTotal',
  'chats',
  'lastOrderId',
  'lastPaymentId',
  'checkoutAddress',
  'selectedPayment',
  'selectedBank',
  'addressMode',
  'userProfile',
  'userName',
  'userEmail',
];

const PROTECTED_PATHS = [
  '/checkout',
  '/cart',
  '/orders',
  '/edit-profile',
  '/my-address',
  '/chat',
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    IonApp,
    IonRouterOutlet,
    IonButton,
    IonIcon,
    SplashScreenComponent,
  ],
  template: `
    <app-splash-screen
      *ngIf="showSplash"
      (finished)="showSplash = false"
    ></app-splash-screen>

    <ion-app>
      <ion-router-outlet></ion-router-outlet>

      <div *ngIf="showSessionPopup" class="session-modal-overlay">
        <div class="session-card">
          <div class="session-icon-container">
            <ion-icon name="time-outline" class="session-icon"></ion-icon>
          </div>

          <h3 class="session-title">Session Habis</h3>

          <p class="session-description">
            {{ sessionMessage }}
          </p>

          <ion-button
            expand="block"
            (click)="closeSessionPopup()"
            class="session-btn"
          >
            Login Ulang
          </ion-button>
        </div>
      </div>
    </ion-app>
  `,
  styles: [`
    .session-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s ease-out;
    }

    .session-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 32px 24px 28px;
      margin: 24px;
      text-align: center;
      max-width: 328px;
      width: 100%;
      box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 20px 40px -4px rgba(246, 207, 216, 0.35),
        0 10px 20px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: scaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .session-icon-container {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #fff0f3 0%, #ffe3e8 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.9), 0 8px 16px rgba(246, 207, 216, 0.5);
    }

    .session-icon {
      font-size: 36px;
      color: #ff3366;
    }

    .session-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }

    .session-description {
      font-size: 14px;
      line-height: 1.6;
      color: #64748b;
      margin: 0 0 26px 0;
    }

    .session-btn {
      --background: #ff3366;
      --background-hover: #e02454;
      --background-activated: #c21844;
      --color: #ffffff;
      --border-radius: 14px;
      --box-shadow: 0 6px 16px rgba(255, 51, 102, 0.3);
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.3px;
      width: 100%;
      height: 48px;
      margin: 0;
      text-transform: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from {
        opacity: 0;
        transform: scale(0.92);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  showSplash = true;
  showSessionPopup = false;
  sessionMessage = 'Session habis, silakan login ulang.';

  private backPressCount = 0;
  private backPressTimer: any = null;

  private sessionListener = (e: Event) => {
    if (this.showSessionPopup) return;
    const detail = (e as CustomEvent).detail;
    this.sessionMessage = detail || 'Session habis, silakan login ulang.';
    this.showSessionPopup = true;
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.checkSession();
    this.initBackButton();
    window.addEventListener('session-expired', this.sessionListener);
  }

  ngOnDestroy() {
    window.removeEventListener('session-expired', this.sessionListener);
    if (this.backPressTimer) {
      clearTimeout(this.backPressTimer);
    }
  }

  closeSessionPopup() {
    this.showSessionPopup = false;
    this.clearAllAuthData();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  private clearAllAuthData() {
    AUTH_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  }

  initBackButton() {
    if (Capacitor.getPlatform() !== 'android') return;

    App.addListener('backButton', async ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
        return;
      }

      if (this.backPressCount === 0) {
        this.backPressCount++;

        const toast = await this.toastCtrl.create({
          message: 'Tekan sekali lagi untuk keluar',
          duration: 2000,
          position: 'bottom',
        });
        await toast.present();

        this.backPressTimer = setTimeout(() => {
          this.backPressCount = 0;
          this.backPressTimer = null;
        }, 2000);

      } else {
        App.exitApp();
      }
    });
  }

  checkSession() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http
      .get(`${environment.apiUrl}/auth/profile`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .subscribe({
        next: (res: any) => {
          if (res?.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403) {
            this.logout();
            return;
          }
          console.warn('[Session] Gagal cek session, status:', err.status);
        },
      });
  }

  private logout() {
    this.clearAllAuthData();

    const currentPath = window.location.pathname;
    const needsRedirect = PROTECTED_PATHS.some(path =>
      currentPath.startsWith(path)
    );

    if (needsRedirect) {
      this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    }
  }
}