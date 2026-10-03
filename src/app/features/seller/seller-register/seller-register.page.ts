import {
  Component,
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
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import {
  RouterModule,
  Router
} from '@angular/router';

import {
  addIcons
} from 'ionicons';

import {
  chevronBackOutline,
  shieldCheckmarkOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-seller-register',
  templateUrl: './seller-register.page.html',
  styleUrls: ['./seller-register.page.scss'],
  standalone: true,

  imports: [
    IonContent,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ]
})

export class SellerRegisterPage
implements OnInit {


  email = '';


  password = '';

  confirmPassword = '';

  showPassword = false;

  showConfirmPassword = false;


  showPopup = false;

  popupMessage = '';

  isSuccess = false;

  apiUrl =
    environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {

    addIcons({

      'chevron-back-outline':
        chevronBackOutline,

      'shield-checkmark-outline':
        shieldCheckmarkOutline,

      'eye-outline':
        eyeOutline,

      'eye-off-outline':
        eyeOffOutline

    });

  }

  ngOnInit() {

    const profile =
      localStorage.getItem(
        'user'
      );

    if (profile) {

      const user =
        JSON.parse(profile);

      this.email =
        user.email || '';

    }

  }
  

  goBack() {

    this.router.navigate([
      '/join-seller'
    ]);

  }

  continueRegister() {


    if (
      !this.password ||
      !this.confirmPassword
    ) {

      this.popupMessage =
        'Password wajib diisi';

      this.showPopup = true;

      return;

    }


    if (
      this.password !==
      this.confirmPassword
    ) {

      this.popupMessage =
        'Konfirmasi password tidak cocok';

      this.showPopup = true;

      return;

    }

    const token =
      localStorage.getItem(
        'token'
      );


    this.http.post(

      `${this.apiUrl}/auth/login`,

      {

        email:
          this.email,

        password:
          this.password

      }

    )
    .subscribe({

      next: (res: any) => {


        localStorage.setItem(
          'sellerRegisterVerified',
          'true'
        );

        this.isSuccess = true;

        this.popupMessage =
          'Verifikasi berhasil';

        this.showPopup = true;

      },

      error: (err) => {

        this.popupMessage =
          'Password akun salah';

        this.showPopup = true;

      }

    });

  }

  closePopup() {

    this.showPopup = false;


    if (this.isSuccess) {

      this.router.navigate([
        '/seller-store'
      ]);

    }

  }

}