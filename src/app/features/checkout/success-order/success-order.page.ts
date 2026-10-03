import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkCircleOutline, bagHandleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-success-order',
  templateUrl: './success-order.page.html',
  styleUrls: ['./success-order.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SuccessOrderPage implements OnInit {

  orderId:  number | null = null;
  isManual = false;  

  constructor(
    private location: Location,
    private router: Router
  ) {
    addIcons({
      arrowBackOutline,
      checkmarkCircleOutline,
      bagHandleOutline
    });
  }

  ngOnInit() {

    const nav = history.state;
    this.orderId  = nav.orderId  || null;
    this.isManual = nav.isManual || false;

    localStorage.removeItem('checkoutItems');
    localStorage.removeItem('checkoutTotal');
    localStorage.removeItem('selectedPayment');
    localStorage.removeItem('selectedBank');
    localStorage.removeItem('selectedVoucher');
    localStorage.removeItem('checkoutAddress');
    localStorage.removeItem('addressMode');

  }

  goHome() {
    this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
  }

  goToPesanan() {
    this.router.navigateByUrl('/orders', { replaceUrl: true });
  }

  goBack() {
    this.router.navigateByUrl('/orders', { replaceUrl: true });
  }

}