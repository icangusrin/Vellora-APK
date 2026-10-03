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
  arrowBackOutline,
  copyOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.page.html',
  styleUrls: ['./payment-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})

export class PaymentDetailPage {

  selectedBank = '';

  virtualAccount =
    '7209054362332';

  bankLogo = '';

  total = 'Rp.0';

  countdown = '00:01:00';

  expiredAt = 0;

  timer: any;

  showCopyPopup = false;

  constructor(
    private location: Location,
    private router: Router
  ) {

    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'copy-outline': copyOutline,
      'checkmark-circle-outline': checkmarkCircleOutline
    });

  }

  ionViewWillEnter() {

    this.selectedBank =
      localStorage.getItem(
        'selectedBank'
      ) || '';

    const savedTotal =
      localStorage.getItem(
        'checkoutTotal'
      );

    if (savedTotal) {

      this.total = savedTotal;

    }

    if (this.selectedBank === 'BRI') {

      this.bankLogo =
        'https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg';

    }

    else if (this.selectedBank === 'BCA') {

      this.bankLogo =
        'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg';

    }

    else {

      this.bankLogo =
        'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg';

    }

    this.expiredAt =
      Date.now() + (1 * 60 * 1000);

    this.startCountdown();

  }

  startCountdown() {

    this.timer = setInterval(() => {

      const distance =
        this.expiredAt - Date.now();

      if (distance <= 0) {

        clearInterval(this.timer);

        this.countdown =
          '00:00:00';

        return;

      }

      const minutes = Math.floor(
        (distance % (1000 * 60 * 60))
        / (1000 * 60)
      );

      const seconds = Math.floor(
        (distance % (1000 * 60))
        / 1000
      );

      this.countdown =
        `00:${minutes
          .toString()
          .padStart(2, '0')}:${seconds
          .toString()
          .padStart(2, '0')}`;

    }, 1000);

  }

  async copyVa() {

    await navigator.clipboard.writeText(
      this.virtualAccount
    );

    this.showCopyPopup = true;

    setTimeout(() => {

      this.showCopyPopup = false;

    }, 1500);

  }

  confirmPayment() {

    clearInterval(this.timer);

    const orders = JSON.parse(
      localStorage.getItem('orders') || '[]'
    );

    if (orders.length > 0) {

      orders[0].status = 'dikemas';

    }

    localStorage.setItem(
      'orders',
      JSON.stringify(orders)
    );

    localStorage.removeItem('checkoutItems');

    localStorage.removeItem('checkoutTotal');

    this.router.navigate([
      '/success-order'
    ]);

  }

  goBack() {

    clearInterval(this.timer);

    this.location.back();

  }

}