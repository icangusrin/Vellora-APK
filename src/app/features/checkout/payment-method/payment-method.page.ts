import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, receiptOutline, qrCodeOutline,
  businessOutline, chevronDownOutline, chevronUpOutline,
  checkmarkCircle
} from 'ionicons/icons';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.page.html',
  styleUrls: ['./payment-method.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class PaymentMethodPage {

  showBank      = false;
  selectedPayment = '';
  selectedBank    = '';

  banks = [
    {
      name: 'BCA',
      code: 'bca',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg'
    },
    {
      name: 'BRI',
      code: 'bri',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg'
    },
    {
      name: 'Mandiri',
      code: 'mandiri',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg'
    },
  ];

  constructor(private location: Location, private router: Router) {
    addIcons({
      'arrow-back-outline':   arrowBackOutline,
      'receipt-outline':      receiptOutline,
      'qr-code-outline':      qrCodeOutline,
      'business-outline':     businessOutline,
      'chevron-down-outline': chevronDownOutline,
      'chevron-up-outline':   chevronUpOutline,
      'checkmark-circle':     checkmarkCircle,
    });
  }

  ionViewWillEnter() {
    const payment = localStorage.getItem('selectedPayment');
    const bank    = localStorage.getItem('selectedBank');
    if (payment) this.selectedPayment = payment;
    if (bank)    this.selectedBank    = bank;
    if (this.selectedPayment === 'Transfer Bank') this.showBank = true;
  }

  selectCod() {
    this.selectedPayment = 'COD';
    this.selectedBank    = '';
    this.showBank        = false;
    localStorage.setItem('selectedPayment', 'COD');
    localStorage.removeItem('selectedBank');
  }

  selectQris() {
    this.selectedPayment = 'QRIS';
    this.selectedBank    = '';
    this.showBank        = false;
    localStorage.setItem('selectedPayment', 'QRIS');
    localStorage.removeItem('selectedBank');
  }

  toggleBank() {
    this.showBank = !this.showBank;
  }

  selectBank(bank: { name: string; code: string }) {
    this.selectedPayment = 'Transfer Bank';
    this.selectedBank    = bank.name;
    localStorage.setItem('selectedPayment', 'Transfer Bank');
    localStorage.setItem('selectedBank', bank.name);
  }

  confirmPayment() {
    if (!this.selectedPayment) {
      alert('Pilih metode pembayaran terlebih dahulu');
      return;
    }
    if (this.selectedPayment === 'Transfer Bank' && !this.selectedBank) {
      alert('Pilih bank tujuan transfer');
      return;
    }
    this.location.back();
  }

  goBack() { this.location.back(); }
}