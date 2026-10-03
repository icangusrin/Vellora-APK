import { Component } from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  IonicModule,
  NavController
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  mailOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-email-otp',
  templateUrl: './email-otp.page.html',
  styleUrls: ['./email-otp.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})

export class EmailOtpPage {

  otp1 = '';
  otp2 = '';
  otp3 = '';
  otp4 = '';

  constructor(
    private router: Router,
    private location: Location,
    private navCtrl: NavController
  ) {

    addIcons({

      'arrow-back-outline':
        arrowBackOutline,

      'mail-outline':
        mailOutline

    });

  }


  goBack() {

    this.location.back();

  }


  verifyOtp() {

    const newEmail =
      localStorage.getItem(
        'newEmail'
      );

    if (newEmail) {

      localStorage.setItem(
        'userEmail',
        newEmail
      );

      const savedProfile =
        localStorage.getItem(
          'userProfile'
        );

      if (savedProfile) {

        const profile =
          JSON.parse(savedProfile);

        profile.email =
          newEmail;

        localStorage.setItem(
          'userProfile',
          JSON.stringify(profile)
        );

      }

    }

    localStorage.removeItem(
      'newEmail'
    );

    this.navCtrl.navigateRoot(
      '/security-account'
    );

  }

}