import { Component } from '@angular/core';
import { Router } from '@angular/router';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  IonicModule
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline
} from 'ionicons/icons';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-change-email',
  templateUrl: './change-email.page.html',
  styleUrls: ['./change-email.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PopupComponent
  ]
})

export class ChangeEmailPage {

  oldEmail = '';

  newEmail = '';

  showErrorPopup = false;

  errorMessage = '';

  constructor(
    private location: Location,
    private router: Router
  ) {

    addIcons({

      'arrow-back-outline':
        arrowBackOutline

    });

  }

  saveEmail() {

    const currentEmail =
      localStorage.getItem(
        'userEmail'
      );

    if (
      this.oldEmail !== currentEmail
    ) {

      this.errorMessage =
        'Email lama tidak sesuai';

      this.showErrorPopup =
        true;

      return;

    }

    if (!this.newEmail) {

      this.errorMessage =
        'Email baru wajib diisi';

      this.showErrorPopup =
        true;

      return;

    }

    localStorage.setItem(
      'newEmail',
      this.newEmail
    );

    this.router.navigate([
      '/email-otp'
    ]);

  }

  closePopup() {

    this.showErrorPopup =
      false;

  }

  goBack() {

    this.location.back();

  }

}