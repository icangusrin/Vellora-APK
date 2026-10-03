import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  lockClosedOutline,
  mailOutline
} from 'ionicons/icons';

import { environment } from 'src/environments/environment';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-lupa-password',
  templateUrl: './lupa-password.page.html',
  styleUrls: ['./lupa-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonContent,
    IonIcon,
    PopupComponent
  ]
})
export class LupaPasswordPage {

  email = '';

  isLoading = false;

  errorMsg = '';

  showPopup = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    addIcons({ arrowBackOutline, lockClosedOutline, mailOutline });
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }

  closePopup() {
    this.showPopup = false;
  }

  sendOtp() {

    this.errorMsg = '';

    if (!this.email.trim()) {
      this.errorMsg = 'Silakan masukkan email terlebih dahulu';
      this.showPopup = true;
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMsg = 'Format email tidak valid';
      this.showPopup = true;
      return;
    }

    this.isLoading = true;

    this.http.post(
      `${environment.apiUrl}/auth/forgot-password`,
      { email: this.email }
    ).subscribe({

      next: (res: any) => {

        this.isLoading = false;
        localStorage.setItem('reset_email', this.email);
        this.router.navigate(['/auth/email-otp'], {
          state: { email: this.email }
        });

      },

      error: (err) => {

        this.isLoading = false;

        this.errorMsg =
          err.error?.message ||
          'Email tidak ditemukan atau terjadi kesalahan';
        this.showPopup = true;

      }

    });

  }

}