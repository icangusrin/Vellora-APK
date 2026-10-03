import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-phone-verification',
  templateUrl: './phone-verification.page.html',
  styleUrls: ['./phone-verification.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon
  ]
})

export class PhoneVerificationPage {

  email = '';

  constructor(
    private location: Location,
    private router: Router
  ) {

    addIcons({
      arrowBackOutline
    });

  }

  goBack() {

    this.location.back();

  }

  confirmVerification() {

    if (!this.email) {

      alert(
        'Email wajib diisi'
      );

      return;

    }

    this.router.navigate([
      '/phone-otp'
    ]);

  }

}