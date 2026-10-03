import { Component } from '@angular/core';

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

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-verify-phone-email',
  templateUrl: './verify-phone-email.page.html',
  styleUrls: ['./verify-phone-email.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})

export class VerifyPhoneEmailPage {

  email = '';

  constructor(
    private location: Location,
    private router: Router
  ) {

    addIcons({
      'arrow-back-outline':
        arrowBackOutline
    });

  }

  goToOtp() {

    this.router.navigate([
      '/verify-phone-otp'
    ]);

  }

  goBack() {

    this.location.back();

  }

}