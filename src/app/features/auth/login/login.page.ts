declare const google: any;

import {
  Component,
  AfterViewInit,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import {
  Router,
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import {
  Capacitor
} from '@capacitor/core';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import {
  FirebaseAuthentication
} from '@capacitor-firebase/authentication';

import {
  addIcons
} from 'ionicons';

import {
  logoGoogle,
  arrowBackOutline,
  bagHandle,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

import {
  environment
} from 'src/environments/environment';
import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterLink,
    IonContent,
    IonIcon,
    PopupComponent
  ]
})

export class LoginPage implements OnInit, AfterViewInit {

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  showPopup: boolean = false;
  popupMessage: string = '';
  isWeb: boolean = false;
  from = '';


  private redirectTo = '/tabs/home';

  apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({
      logoGoogle,
      arrowBackOutline,
      bagHandle,
      eyeOutline,
      eyeOffOutline
    });

    this.isWeb = Capacitor.getPlatform() === 'web';

    this.route.queryParams.subscribe(params => {
      this.from = params['from'] || '';


      if (params['redirectTo']) {
        this.redirectTo = params['redirectTo'];
      }
    });
  }

  async ngOnInit() {}

  ngAfterViewInit(): void {
    if (this.isWeb) {
      setTimeout(() => {
        this.initializeWebGoogle();
      }, 1000);
    }
  }


  private navigateAfterLogin() {

    this.router.navigateByUrl(this.redirectTo, { replaceUrl: true });
  }


  initializeWebGoogle() {
    if (!(window as any).google) {
      console.log('GOOGLE WEB BELUM LOAD');
      return;
    }

    google.accounts.id.initialize({
      client_id: '803661480295-k9f3us50l2965gs95509tbt36im9hbdt.apps.googleusercontent.com',
      callback: (response: any) => {
        this.handleWebGoogleLogin(response);
      }
    });

    google.accounts.id.renderButton(
      document.getElementById('google-button'),
      {
        theme: 'outline',
        size: 'large',
        width: 280,
        text: 'signin_with'
      }
    );
  }

  handleWebGoogleLogin(response: any) {
    const payload = { id_token: response.credential };

    this.http.post(`${this.apiUrl}/auth/google`, payload).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        this.popupMessage = 'Login Google berhasil';
        this.showPopup = true;
        setTimeout(() => { this.navigateAfterLogin(); }, 1200);
      },
      error: (err) => {
        console.log(err);
        this.showPopup = true;
        this.popupMessage = 'Login Google gagal';
      }
    });
  }



  async loginGoogle() {
    if (this.isWeb) return;

    this.isLoading = true;

    try {
      const result = await FirebaseAuthentication.signInWithGoogle({
        customParameters: [
          { key: 'prompt', value: 'select_account' }
        ]
      });

      const idToken = result.credential?.idToken;

      if (!idToken) {
        throw new Error('Gagal mendapatkan ID token dari Google.');
      }

      const payload = { id_token: idToken };

      this.http.post(`${this.apiUrl}/auth/google`, payload).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.popupMessage = 'Login berhasil';
          this.showPopup = true;
          setTimeout(() => { this.navigateAfterLogin(); }, 1200);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Google API error:', err);
          this.showPopup = true;
          this.popupMessage = 'Login Google gagal';
        }
      });

    } catch (error: any) {
      this.isLoading = false;

      if (
        error?.code === 'sign_in_cancelled' ||
        error?.message?.includes('canceled') ||
        error?.message?.includes('cancelled')
      ) {
        return;
      }

      console.error('RAW ERROR:', error);
      this.popupMessage = `Error: ${error?.code} - ${error?.message || JSON.stringify(error)}`;
      this.showPopup = true;
    }
  }


  login() {
    this.loginManual();
  }

  loginManual() {
    this.isLoading = true;

    const payload = {
      email: this.email,
      password: this.password
    };

    this.http.post(`${this.apiUrl}/auth/login`, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        this.popupMessage = 'Login berhasil! Mengalihkan...';
        this.showPopup = true;
        setTimeout(() => { this.navigateAfterLogin(); }, 1200);
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
        this.showPopup = true;
        this.popupMessage = 'Email atau password salah';
      }
    });
  }



  closePopup() {
    this.showPopup = false;
  }



  goBack() {
    this.router.navigateByUrl('/welcome', { replaceUrl: true });
  }

  goToForgotPassword() {
    this.router.navigate(['/auth/lupa-password']);
  }
}