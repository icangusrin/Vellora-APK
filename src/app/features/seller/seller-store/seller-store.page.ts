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
  HttpHeaders
} from '@angular/common/http';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
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
  chevronBackOutline
} from 'ionicons/icons';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-seller-store',
  templateUrl: './seller-store.page.html',
  styleUrls: ['./seller-store.page.scss'],
  standalone: true,

  imports: [
    IonContent,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})

export class SellerStorePage
implements OnInit {

  name = '';

  storeName = '';

  phone = '';

  showPopup = false;

  popupMessage = '';


  isSuccess = false;

  apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {

    addIcons({

      'chevron-back-outline':
        chevronBackOutline

    });

  }

  ngOnInit() {

    const verified =
      localStorage.getItem(
        'sellerRegisterVerified'
      );

    if (!verified) {

      this.router.navigate([
        '/seller-register'
      ]);

      return;

    }

    const profile =
      localStorage.getItem('user');

    if (profile) {

      const user =
        JSON.parse(profile);

      this.name =
        user.name || user.username || '';

    }

  }

  goBack() {

    this.router.navigate([
      '/seller-register'
    ]);

  }

  registerSeller() {

    if (
      !this.name ||
      !this.storeName ||
      !this.phone
    ) {

      this.popupMessage =
        'Semua field wajib diisi';

      this.showPopup = true;

      return;

    }

    const token =
      localStorage.getItem(
        'token'
      );

    this.http.post(

      `${this.apiUrl}/stores`,

      {

        store_name:
          this.storeName,

        phone_number:
          this.phone

      },

      {

        headers:
          new HttpHeaders({

            Authorization:
              `Bearer ${token}`

          })

      }

    )
    .subscribe({

      next: (res: any) => {

        console.log(
          'REGISTER SELLER:',
          res
        );

        const savedUser =
          JSON.parse(
            localStorage.getItem('user') || '{}'
          );

        savedUser.role = 'seller';

        localStorage.setItem(
          'user',
          JSON.stringify(savedUser)
        );

        localStorage.removeItem(
          'sellerRegisterVerified'
        );

        this.isSuccess = true;

        this.popupMessage =
          'Berhasil daftar seller';

        this.showPopup = true;

      },

      error: (err) => {

        console.log(
          'SELLER ERROR:',
          err
        );

        this.popupMessage =

          err.error?.message ||

          'Gagal daftar seller';

        this.showPopup = true;

      }

    });

  }

  closePopup() {

    this.showPopup = false;

    if (this.isSuccess) {

      this.router.navigate([
        '/seller-success'
      ]);

    }

  }

}