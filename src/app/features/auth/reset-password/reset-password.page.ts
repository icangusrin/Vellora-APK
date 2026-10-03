import { Component, OnInit } from '@angular/core';
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
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

import { environment } from 'src/environments/environment';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
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
export class ResetPasswordPage implements OnInit {

  newPassword = '';
  confirmPassword = '';


  email = '';
  otp = '';

  isLoading = false;
  errorMsg = '';
  showNew = false;
  showConfirm = false;
  showPopup = false;
  isSuccess = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    addIcons({ arrowBackOutline, eyeOutline, eyeOffOutline });
  }

  ngOnInit() {

    const nav = history.state;
    this.email = nav.email || '';
    this.otp = nav.otp || '';


    if (!this.email || !this.otp) {
      this.router.navigate(['/auth/lupa-password']);
    }

  }

  goBack() {
    this.router.navigate(['/auth/email-otp'], {
      state: { email: this.email }
    });
  }

  closePopup() {
    this.showPopup = false;
    if (this.isSuccess) {
      this.router.navigateByUrl('/auth/login', { replaceUrl: true });
    }
  }

  savePassword() {

    this.errorMsg = '';

    if (!this.newPassword.trim()) {
      this.errorMsg = 'Password baru wajib diisi';
      this.showPopup = true;
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMsg = 'Password minimal 8 karakter';
      this.showPopup = true;
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Password tidak cocok';
      this.showPopup = true;
      return;
    }

    this.isLoading = true;

    this.http.post(
      `${environment.apiUrl}/auth/reset-password`,
      {
        email: this.email,
        otp: this.otp,
        password: this.newPassword,
        password_confirmation: this.confirmPassword
      }
    ).subscribe({

      next: () => {

        this.isLoading = false;
        this.isSuccess = true;
        this.errorMsg = 'Password berhasil diubah. Silakan login kembali.';
        this.showPopup = true;

      },

      error: (err) => {

        this.isLoading = false;

        this.errorMsg =
          err.error?.message ||
          'Gagal mengubah password, coba lagi';
        this.showPopup = true;

      }

    });

  }

}