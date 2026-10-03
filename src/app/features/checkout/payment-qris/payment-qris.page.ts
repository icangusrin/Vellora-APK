import { Component, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { arrowBackOutline, refreshOutline, qrCodeOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment-qris',
  templateUrl: './payment-qris.page.html',
  styleUrls: ['./payment-qris.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule, RouterLink]
})
export class PaymentQrisPage implements OnDestroy {

  total        = 'Rp.0';
  orderId:   number | null = null;
  paymentId: number | null = null;

  subtotal     = 0;
  shippingCost = 0;
  discount     = 0;
  gatewayFee   = 0;
  hasBreakdown = false;

  qrisImageUrl  = '';

  countdown     = '15:00';
  expiredAtMs   = 0;
  isExpired     = false;
  isLoading     = false;   // loading saat fetch ulang QR
  isPolling     = false;   // loading saat cek status
  errorMsg      = '';

  private timerRef:   any;
  private pollingRef: any;

  constructor(
    private location: Location,
    private router:   Router,
    private http:     HttpClient
  ) {
    addIcons({ arrowBackOutline, refreshOutline, qrCodeOutline });
  }

  ionViewWillEnter() {
    const nav = history.state;

    this.orderId     = nav.orderId     || Number(localStorage.getItem('lastOrderId'));
    this.paymentId   = nav.paymentId   || Number(localStorage.getItem('lastPaymentId'));
    this.total       = nav.total       || localStorage.getItem('checkoutTotal') || 'Rp.0';

  
    if (nav.subtotal !== undefined) {
      this.subtotal     = nav.subtotal     || 0;
      this.shippingCost = nav.shippingCost || 0;
      this.discount     = nav.discount     || 0;
      this.gatewayFee   = nav.gatewayFee   || 0;
      this.hasBreakdown = true;
    } else {
      this.hasBreakdown = false;
    }

    const maxExpired = Date.now() + 15 * 60 * 1000;
    this.expiredAtMs = nav.expiredAtMs
      ? Math.min(nav.expiredAtMs, maxExpired)
      : maxExpired;
    this.qrisImageUrl = nav.qrisImageUrl || '';

    if (!this.qrisImageUrl && this.orderId) {
      this.fetchQrisFromApi();
    }

    this.startCountdown();
    this.startPolling();
  }

  ionViewWillLeave() { this.stopAll(); }
  ngOnDestroy()      { this.stopAll(); }

  private stopAll() {
    clearInterval(this.timerRef);
    clearInterval(this.pollingRef);
  }


  fetchQrisFromApi() {
    if (!this.orderId) return;
    const token = localStorage.getItem('token');
    if (!token) { this.router.navigate(['/auth/login']); return; }

    this.isLoading = true;
    this.errorMsg  = '';

    this.http.post(
      `${environment.apiUrl}/payments/${this.orderId}`,
      {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.data?.qris_image_url) {
          this.qrisImageUrl = res.data.qris_image_url;
        }
        if (res.data?.expired_at_ms) {
          this.expiredAtMs = res.data.expired_at_ms;
          this.startCountdown();
        }
        if (res.data?.payment_id) {
          this.paymentId = res.data.payment_id;
          localStorage.setItem('lastPaymentId', String(this.paymentId));
        }
        if (!res.data?.qris_image_url) {
          this.errorMsg = 'QR Code tidak tersedia, coba refresh';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg  = err.error?.message || 'Gagal memuat QR Code';
      }
    });
  }

  startCountdown() {
    clearInterval(this.timerRef);

    this.timerRef = setInterval(() => {
      const distance = this.expiredAtMs - Date.now();

      if (distance <= 0) {
        clearInterval(this.timerRef);
        clearInterval(this.pollingRef);
        this.countdown = '00:00';
        this.isExpired = true;
        return;
      }

      const m = Math.floor(distance / 60000);
      const s = Math.floor((distance % 60000) / 1000);
      this.countdown = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  startPolling() {
    clearInterval(this.pollingRef);

    this.pollingRef = setInterval(() => {
      if (this.isExpired || !this.orderId) {
        clearInterval(this.pollingRef);
        return;
      }
      this.doPollStatus();
    }, 5000);
  }

  doPollStatus() {
    if (this.isPolling) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    this.isPolling = true;

    this.http.get(
      `${environment.apiUrl}/payments/${this.orderId}/status`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: (res: any) => {
        this.isPolling = false;
        if (res.data?.is_paid) {
          this.stopAll();
          localStorage.removeItem('checkoutTotal');
          localStorage.removeItem('lastOrderId');
          localStorage.removeItem('lastPaymentId');
          this.router.navigate(['/checkout/success-order'], {
            state: { orderId: this.orderId }
          });
        }
      },
      error: () => { this.isPolling = false; }
    });
  }

  checkManually() {
    this.doPollStatus();
  }

  goBack() {
    this.stopAll();
    if (this.orderId) {
      this.router.navigate(['/rincian-pesanan', this.orderId], { replaceUrl: true });
    } else {
      this.router.navigate(['/orders'], { replaceUrl: true });
    }
  }
}
