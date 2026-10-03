import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  CommonModule,
  Location
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
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    PopupComponent
  ]
})

export class ChangePasswordPage {

  currentPassword = '';

  newPassword = '';

  confirmPassword = '';


  showSuccessPopup = false;


  showErrorPopup = false;

  errorMessage = '';

  constructor(
    private location: Location,
    private http: HttpClient
  ) {

    addIcons({
      arrowBackOutline,
      shieldCheckmarkOutline
    });

  }

  goBack() {

    this.location.back();

  }

  changePassword() {

    if (
      !this.currentPassword ||
      !this.newPassword ||
      !this.confirmPassword
    ) {

      this.errorMessage =
        'Semua field wajib diisi';

      this.showErrorPopup = true;

      return;

    }

  
    if (
      this.newPassword !==
      this.confirmPassword
    ) {

      this.errorMessage =
        'Konfirmasi password tidak cocok';

      this.showErrorPopup = true;

      return;

    }

    const token =
      localStorage.getItem(
        'token'
      );


    this.http.put(
      `${environment.apiUrl}/auth/change-password`,

      {

        old_password:
          this.currentPassword,

        new_password:
          this.newPassword

      },

      {

        headers: new HttpHeaders({

          Authorization:
            'Bearer ' + token

        })

      }

    ).subscribe({

      next: (res: any) => {

        console.log(
          'CHANGE PASSWORD:',
          res
        );

        this.showSuccessPopup =
          true;

      },

      error: (err) => {

        console.log(
          'PASSWORD ERROR:',
          err
        );

        this.errorMessage =

          err.error.message ||

          'Gagal mengubah password';

        this.showErrorPopup =
          true;

      }

    });

  }

  closeErrorPopup() {

    this.showErrorPopup =
      false;

  }

  finishChangePassword() {

    this.showSuccessPopup =
      false;

    this.location.back();

  }

}