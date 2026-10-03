import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HttpClient, HttpHeaders, HttpClientModule
} from '@angular/common/http';
import {
  IonContent, IonIcon, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, chatbubbleOutline, locationOutline,
  chevronForwardOutline, copyOutline, walletOutline, cubeOutline
} from 'ionicons/icons';
import { ChatService } from '../../../core/services/chat.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rincian-pesanan',
  templateUrl: './rincian-pesanan.page.html',
  styleUrls: ['./rincian-pesanan.page.scss'],
  standalone: true,
  imports: [
    CommonModule, HttpClientModule,
    IonContent, IonIcon
  ]
})
export class RincianPesananPage implements OnInit, OnDestroy {

  order: any = null;
  isLoading = true;
  errorMsg  = '';

  countdownText   = '';
  isPayExpired    = false;
  private countdownInterval: any = null;

  constructor(
    private route:       ActivatedRoute,
    private location:    Location,
    private router:      Router,
    private http:        HttpClient,
    private chatService: ChatService
  ) {
    addIcons({
      arrowBackOutline, chatbubbleOutline, locationOutline,
      chevronForwardOutline, copyOutline, walletOutline, cubeOutline
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadOrder(id);
      } else {
        this.location.back();
      }
    });
  }

  ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    }
  }

  loadOrder(id: string) {

    const token = localStorage.getItem('token');
    if (!token) { this.router.navigate(['/auth/login']); return; }

    this.isLoading = true;

    this.http.get(
      `${environment.apiUrl}/orders/${id}`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({

      next: (res: any) => {
        const data = res.data;
        if (data) {
          data.product_subtotal = Number(data.product_subtotal) || 0;
          data.shipping_cost    = Number(data.shipping_cost) || 0;
          data.voucher_discount = Number(data.voucher_discount) || 0;
          data.total_amount     = Number(data.total_amount) || 0;

          if (data.items) {
            data.items.forEach((item: any) => {
              item.price    = Number(item.price) || 0;
              item.subtotal = Number(item.subtotal) || 0;
            });
          }
        }
        
        this.order     = data;
        this.isLoading = false;

        this.checkPaymentExpiry();
      },

      error: () => {
        this.isLoading = false;
        this.errorMsg  = 'Gagal memuat detail pesanan';
      }

    });

  }


  getStatusText(status: string): string {
    const map: Record<string, string> = {
      pending_payment:      'Belum Dibayar',
      waiting_verification: 'Menunggu Verifikasi',
      processing:           'Pesanan Dikemas',
      shipped:              'Pesanan Dikirim',
      delivered:            'Pesanan Selesai',
      cancelled:            'Pesanan Dibatalkan',
    };
    return map[status] || 'Pesanan';
  }


  checkPaymentExpiry() {
    if (!this.order || this.order.status !== 'pending_payment') {
      this.clearCountdown();
      return;
    }

    let deadlineMs: number;

    if (this.order.payment_expired_at) {
      deadlineMs = new Date(this.order.payment_expired_at).getTime();
    } else if (this.order.payment_expired_ms) {
      deadlineMs = this.order.payment_expired_ms;
    } else {
      deadlineMs = new Date(this.order.created_at).getTime() + 24 * 60 * 60 * 1000;
    }

    const now = Date.now();

    if (now >= deadlineMs) {
      this.isPayExpired = true;
      this.countdownText = 'Waktu pembayaran habis';
      this.clearCountdown();
      this.autoCancelOrder();
    } else {
      this.isPayExpired = false;
      this.startCountdown(deadlineMs);
    }
  }

  private startCountdown(deadlineMs: number) {
    this.clearCountdown();
    this.updateCountdownText(deadlineMs);

    this.countdownInterval = setInterval(() => {
      const remaining = deadlineMs - Date.now();
      if (remaining <= 0) {
        this.isPayExpired    = true;
        this.countdownText   = 'Waktu pembayaran habis';
        this.clearCountdown();
        this.autoCancelOrder();
      } else {
        this.updateCountdownText(deadlineMs);
      }
    }, 1000);
  }

  private updateCountdownText(deadlineMs: number) {
    const remaining = deadlineMs - Date.now();
    if (remaining <= 0) { this.countdownText = 'Waktu pembayaran habis'; return; }

    const totalSec = Math.floor(remaining / 1000);
    const hh = Math.floor(totalSec / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;

    this.countdownText =
      `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  }

  private clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private autoCancelOrder() {
    if (!this.order || this.order.status === 'cancelled') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.put(
      `${environment.apiUrl}/orders/${this.order.id}/cancel`,
      {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: () => {
        this.order.status = 'cancelled';
      },
      error: () => {
        this.order.status = 'cancelled';
      }
    });
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  
  hubungiPenjual() {

    const firstItem = this.order?.items?.[0];
    const sellerId  = firstItem?.store_user_id;

    if (!sellerId) {
      alert('Informasi penjual tidak tersedia');
      return;
    }

    this.chatService.createRoom({
      seller_id:  sellerId,
      product_id: firstItem?.product_id || null
    }).subscribe({

      next: (res: any) => {
        const roomId = res.data.id;
        this.router.navigate(['/chat-detail', roomId], {
          state: {
            chatData: {
              name:   firstItem?.store_name || 'Penjual',
              avatar: null
            }
          }
        });
      },

      error: (err) => {
        console.log('CREATE ROOM ERROR:', err);
        alert('Gagal membuka chat');
      }

    });

  }

  cancelOrder() {

    if (!confirm('Apakah kamu yakin ingin membatalkan pesanan ini?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.put(
      `${environment.apiUrl}/orders/${this.order.id}/cancel`,
      {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({

      next: () => {
        this.order.status = 'cancelled';
      },

      error: (err) => {
        alert(err.error?.message || 'Gagal membatalkan pesanan');
      }

    });

  }

  goToPayment() {

    if (this.order.payment_method === 'QRIS') {

      this.router.navigate(['/payment-qris'], {
        state: {
          orderId:     this.order.id,
          paymentId:   this.order.payment_id,
          total:       'Rp.' + Number(this.order.total_amount).toLocaleString('id-ID'),
          expiredAtMs: this.order.payment_expired_ms
        }
      });

    } else {

      this.router.navigate(['/pending-payment'], {
        state: {
          orderId:     this.order.id,
          paymentId:   this.order.payment_id,
          total:       'Rp.' + Number(this.order.total_amount).toLocaleString('id-ID'),
          bank:        this.order.bank_name,
          method:      this.order.payment_method,
          expiredAtMs: this.order.payment_expired_ms
        }
      });

    }

  }

  goToLacakPesanan() {
    this.router.navigate(['/lacak-pesanan', this.order?.id]);
  }

  copyText(text: string) {
    navigator.clipboard.writeText(text).then(() => alert('Disalin!'));
  }

  getImage(img: string): string {
    if (!img) return 'assets/no-image.png';
    if (img.startsWith('http')) return img;
    return `${environment.baseUrl}/` + img;
  }

  goBack() { this.location.back(); }

}