import {
  Component, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  HttpClient, HttpHeaders, HttpClientModule
} from '@angular/common/http';
import {
  IonContent, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pesanan',
  templateUrl: './pesanan.page.html',
  styleUrls: ['./pesanan.page.scss'],
  standalone: true,
  imports: [
    CommonModule, HttpClientModule,
    IonContent, IonIcon
  ]
})
export class PesananPage implements OnInit, OnDestroy {

  selectedStatus = 'semua';
  orders: any[]  = [];
  isLoading = false;

  private timerRef: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params['status']) this.selectedStatus = params['status'];
    });

    this.loadOrders();

    this.timerRef = setInterval(() => {
      let changed = false;
      const now = Date.now();

      for (const o of this.orders) {
        if (o.status === 'pending_payment' && o.payment_expired_ms && now >= o.payment_expired_ms) {
          o.status = 'cancelled';
          changed = true;
          this.autoCancelOrder(o);
        }
      }


      this.orders = [...this.orders];
    }, 1000);

  }

  ngOnDestroy() { clearInterval(this.timerRef); }

  ionViewWillEnter() { this.loadOrders(); }


  autoCancelOrder(order: any) {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.put(
      `${environment.apiUrl}/orders/${order.id}/cancel`,
      {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe();
  }


  loadOrders() {

    const token = localStorage.getItem('token');
    if (!token) { this.router.navigate(['/auth/login']); return; }

    this.isLoading = true;

    this.http.get(
      `${environment.apiUrl}/orders/my-orders`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({

      next: (res: any) => {
        const data = res.data || [];
        this.orders = data.map((o: any) => {
          o.total_amount = Number(o.total_amount) || 0;
          if (o.status === 'pending_payment') {
            if (o.payment_expired_at) {
              o.payment_expired_ms = new Date(o.payment_expired_at).getTime();
            } else if (!o.payment_expired_ms) {
              o.payment_expired_ms = new Date(o.created_at).getTime() + 24 * 60 * 60 * 1000;
            }
          }
          return o;
        });
        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;
      }

    });

  }

 
  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending_payment:      'Belum Dibayar',
      waiting_verification: 'Verifikasi',
      processing:           'Dikemas',
      shipped:              'Dikirim',
      delivered:            'Selesai',
      cancelled:            'Dibatalkan',
    };
    return map[status] || status;
  }


  getRemainingTime(expiredMs: number): string {
    if (!expiredMs) return '--:--';
    const dist = expiredMs - Date.now();
    if (dist <= 0) return '00:00';
    const h = Math.floor(dist / 3600000);
    const m = Math.floor((dist % 3600000) / 60000);
    const s = Math.floor((dist % 60000) / 1000);
    if (h > 0) return `${h}j ${String(m).padStart(2,'0')}m`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  get filteredOrders() {
    if (this.selectedStatus === 'semua') return this.orders;

    const statusFilterMap: Record<string, string[]> = {
      'belum-dibayar': ['pending_payment', 'waiting_verification'],
      'dikemas':       ['processing'],
      'dikirim':       ['shipped'],
      'selesai':       ['delivered'],
      'dibatalkan':    ['cancelled'],
    };

    const dbStatuses = statusFilterMap[this.selectedStatus] || [this.selectedStatus];
    return this.orders.filter(o => dbStatuses.includes(o.status));
  }

  selectStatus(s: string) { this.selectedStatus = s; }

  openDetail(order: any) {
    this.router.navigate(['/rincian-pesanan', order.id]);
  }

  goBack() { this.router.navigate(['/tabs/profile']); }

  getProductImage(order: any): string {
    const img = order.product_image;
    if (!img) return 'assets/no-image.png';
    if (img.startsWith('http')) return img;
    return `${environment.baseUrl}/` + img;
  }

}