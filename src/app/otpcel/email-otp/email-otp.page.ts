import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
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
  mailOutline
} from 'ionicons/icons';

import { environment } from 'src/environments/environment';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-email-otp',
  templateUrl: './email-otp.page.html',
  styleUrls: ['./email-otp.page.scss'],
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
export class EmailOtpPage implements OnInit, OnDestroy {

  otp1 = '';
  otp2 = '';
  otp3 = '';
  otp4 = '';

  email = '';

  timer = 60;
  private timerInterval: any;
  get canResend(): boolean { return this.timer === 0; }


  isLoading = false;
  errorMsg = '';
  showPopup = false;


  @ViewChild('box1') box1!: ElementRef<HTMLInputElement>;
  @ViewChild('box2') box2!: ElementRef<HTMLInputElement>;
  @ViewChild('box3') box3!: ElementRef<HTMLInputElement>;
  @ViewChild('box4') box4!: ElementRef<HTMLInputElement>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    addIcons({ arrowBackOutline, mailOutline });
  }

  ngOnInit() {


    const nav = history.state;
    this.email = nav.email || '';

    if (!this.email) {
      this.router.navigate(['/auth/lupa-password']);
      return;
    }

    this.startTimer();

  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  closePopup() {
    this.showPopup = false;
  }

 
  startTimer() {
    this.timer = 60;
    clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {

      if (this.timer > 0) {
        this.timer--;
      } else {
        clearInterval(this.timerInterval);
      }

    }, 1000);
  }

  onInput(
    event: any,
    next: HTMLInputElement | null,
    prev: HTMLInputElement | null
  ) {

    const val = event.target.value;

    event.target.value =
      val.replace(/[^0-9]/g, '').slice(0, 1);

    if (val && next) {
      next.focus();
    }

  }

  onKeyDown(
    event: KeyboardEvent,
    prev: HTMLInputElement | null
  ) {

    if (
      event.key === 'Backspace' &&
      !(event.target as HTMLInputElement).value &&
      prev
    ) {

      prev.focus();

    }

  }

  resendCode() {

    if (!this.canResend) return;

    this.otp1 = '';
    this.otp2 = '';
    this.otp3 = '';
    this.otp4 = '';
    this.errorMsg = '';

    this.http.post(
      `${environment.apiUrl}/auth/forgot-password`,
      { email: this.email }
    ).subscribe({

      next: () => {
        this.startTimer();
        this.errorMsg = 'OTP Berhasil dikirim ulang';
        this.showPopup = true;
        setTimeout(() => this.box1?.nativeElement.focus(), 100);
      },

      error: (err) => {
        this.errorMsg = err.error?.message || 'Gagal mengirim ulang OTP';
        this.showPopup = true;
      }

    });

  }

  verifyOtp() {

    const otp = this.otp1 + this.otp2 + this.otp3 + this.otp4;

    if (otp.length !== 4) {
      this.errorMsg = 'Masukkan 4 digit kode OTP';
      this.showPopup = true;
      return;
    }

    this.errorMsg = '';
    this.isLoading = true;

    this.http.post(
      `${environment.apiUrl}/auth/verify-otp`,
      { email: this.email, otp }
    ).subscribe({

      next: (res: any) => {

        this.isLoading = false;

        this.router.navigate(['/auth/reset-password'], {
          state: { email: this.email, otp }
        });

      },

      error: (err) => {

        this.isLoading = false;

        this.errorMsg =
          err.error?.message ||
          'Kode OTP salah atau sudah kedaluwarsa';
        this.showPopup = true;

      }

    });

  }

  goBack() {
    this.router.navigate(['/auth/lupa-password']);
  }

}