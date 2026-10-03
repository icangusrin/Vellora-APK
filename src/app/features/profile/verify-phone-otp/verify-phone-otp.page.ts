import { Component } from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  IonicModule
} from '@ionic/angular';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-verify-phone-otp',
  templateUrl: './verify-phone-otp.page.html',
  styleUrls: ['./verify-phone-otp.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})

export class VerifyPhoneOtpPage {

  constructor(
    private location: Location,
    private router: Router
  ) {

    addIcons({
      'arrow-back-outline':
        arrowBackOutline
    });

  }

  verifyOtp() {

    const newPhone =
      localStorage.getItem(
        'newPhone'
      );

    if (newPhone) {

      localStorage.setItem(
        'userPhone',
        newPhone
      );

    }

    this.router.navigate([
      '/security-account'
    ]);

  }

  goBack() {

    this.location.back();

  }

}