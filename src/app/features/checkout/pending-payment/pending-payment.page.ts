import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, timeOutline,
  qrCodeOutline, businessOutline, homeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-pending-payment',
  templateUrl: './pending-payment.page.html',
  styleUrls: ['./pending-payment.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PendingPaymentPage implements OnDestroy {

  total      = 'Rp.0';
  orderId:   number | null = null;
  paymentId: number | null = null;
  bank       = '';
  method     = '';

  vaNumber   = '';

  countdown   = '23:59:59';
  expiredAtMs = 0;
  isExpired   = false;
  private timerRef: any;

  constructor(
    private location: Location,
    private router: Router
  ) {
    addIcons({ arrowBackOutline, timeOutline, qrCodeOutline, businessOutline, homeOutline });
  }

  ionViewWillEnter() {
    const nav = history.state;

    this.orderId     = nav.orderId    || Number(localStorage.getItem('lastOrderId'));
    this.paymentId   = nav.paymentId  || Number(localStorage.getItem('lastPaymentId'));
    this.total       = nav.total      || localStorage.getItem('checkoutTotal') || 'Rp.0';
    this.bank        = nav.bank       || localStorage.getItem('selectedBank')   || '';
    this.method      = nav.method     || localStorage.getItem('selectedPayment') || '';
    this.expiredAtMs = nav.expiredAtMs || 0;
    this.vaNumber    = nav.vaNumber   || '';

    if (this.orderId)   localStorage.setItem('lastOrderId',   String(this.orderId));
    if (this.paymentId) localStorage.setItem('lastPaymentId', String(this.paymentId));

    this.startCountdown();
  }

  ionViewWillLeave() { clearInterval(this.timerRef); }
  ngOnDestroy()      { clearInterval(this.timerRef); }

  startCountdown() {
    clearInterval(this.timerRef);
    const deadline = this.expiredAtMs || (Date.now() + 24 * 60 * 60 * 1000);

    this.timerRef = setInterval(() => {
      const distance = deadline - Date.now();

      if (distance <= 0) {
        clearInterval(this.timerRef);
        this.countdown = '00:00:00';
        this.isExpired = true;
        return;
      }

      const h = Math.floor(distance / 3600000);
      const m = Math.floor((distance % 3600000) / 60000);
      const s = Math.floor((distance % 60000) / 1000);
      this.countdown =
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  goToPayment() {
    if (this.method === 'QRIS') {
      this.router.navigate(['/checkout/payment-qris'], {
        state: {
          orderId:      this.orderId,
          paymentId:    this.paymentId,
          total:        this.total,
          expiredAtMs:  this.expiredAtMs,
        }
      });
    } else {
      this.router.navigate(['/checkout/payment-manual'], {
        state: {
          orderId:   this.orderId,
          paymentId: this.paymentId,
          total:     this.total,
          bank:      this.bank,
          method:    this.method,
          vaNumber:  this.vaNumber,  
        }
      });
    }
  }

  goHome()   { this.router.navigate(['/tabs/home']); }
  goOrders() { this.router.navigate(['/orders']); }
  goBack() {
    this.router.navigate(['/orders'], { replaceUrl: true });
  }
}
