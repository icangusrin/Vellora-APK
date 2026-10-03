import {
  Component
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
  RouterLink
} from '@angular/router';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import {
  addIcons
} from 'ionicons';

import {
  arrowBackOutline,
  bagHandle,
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline
} from 'ionicons/icons';

import {
  environment
} from 'src/environments/environment';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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

export class RegisterPage {

  name: string = '';

  email: string = '';

  password: string = '';

  confirmPassword: string = '';

  showPassword: boolean = false;

  showConfirmPassword: boolean = false;

  isLoading: boolean = false;

  showPopup: boolean = false;

  popupMessage: string = '';

  apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {

    addIcons({
      arrowBackOutline,
      bagHandle,
      eyeOutline,
      eyeOffOutline,
      alertCircleOutline
    });

  }

  /*
  =========================
  REGISTER MANUAL
  =========================
  */

  register() {

    if (!this.name.trim()) {

      this.popupMessage =
        'Username wajib diisi';

      this.showPopup = true;

      return;

    }

    if (this.name.trim().length < 4) {

      this.popupMessage =
        'Username minimal 4 karakter';

      this.showPopup = true;

      return;

    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.email)) {

      this.popupMessage =
        'Format email tidak valid';

      this.showPopup = true;

      return;

    }

    if (this.password.length < 8) {

      this.popupMessage =
        'Password minimal 8 karakter';

      this.showPopup = true;

      return;

    }

    if (this.password !== this.confirmPassword) {

      this.popupMessage =
        'Password dan konfirmasi tidak sama';

      this.showPopup = true;

      return;

    }

    this.isLoading = true;

    const payload = {

      name: this.name.trim(),

      email: this.email.trim(),

      password: this.password,

      password_confirmation:
        this.confirmPassword

    };

    this.http.post(
      `${this.apiUrl}/auth/register`,
      payload
    ).subscribe({

      next: (res: any) => {

        this.isLoading = false;

        this.popupMessage =
          'Register berhasil';

        this.showPopup = true;

        setTimeout(() => {

          this.router.navigate([
            '/auth/login'
          ]);

        }, 1200);

      },

      error: (err) => {

        console.log(err);

        this.isLoading = false;

        this.showPopup = true;

        this.popupMessage =
          err.error?.message ||
          'Register gagal, coba lagi';

      }

    });

  }

  /*
  =========================
  TUTUP POPUP
  =========================
  */

  closePopup() {

    this.showPopup = false;

  }

  /*
  =========================
  KEMBALI
  =========================
  */

  goBack() {

    this.router.navigateByUrl(
      '/welcome',
      { replaceUrl: true }
    );

  }

}
