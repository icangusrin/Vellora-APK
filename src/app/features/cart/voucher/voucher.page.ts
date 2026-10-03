import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient, HttpHeaders, HttpClientModule
} from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, ticketOutline,
  checkmarkCircleOutline, timeOutline, alertCircleOutline,
  lockClosedOutline, personOutline
} from 'ionicons/icons';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from 'src/environments/environment';


import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-voucher',
  templateUrl: './voucher.page.html',
  styleUrls: ['./voucher.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule, IonContent, IonIcon
  ]
})
export class VoucherPage implements OnInit {

  vouchers: any[]   = [];
  myVouchers: any[] = [];
  activeTab         = 'all';

  isLoading            = false;
  claimingId: number | null = null;

  showPopup = false;
  popupMsg  = '';
  popupOk   = true;

  storeId:   number | null = null;
  storeName: string = '';

  isLoggedIn = false;


  selectedVoucher: any = null;


  showLoginPopup = false;

  constructor(
    private http:        HttpClient,
    private router:      Router,
    private route:       ActivatedRoute,
    private location:    Location,
    private cartService: CartService,
    private authService: AuthService
  ) {
    addIcons({
      arrowBackOutline, ticketOutline,
      checkmarkCircleOutline, timeOutline, alertCircleOutline,
      lockClosedOutline, personOutline
    });
  }

  ionViewWillEnter() {

    this.isLoggedIn = this.authService.isLoggedIn();


    if (!this.isLoggedIn) {
      this.showLoginPopup = true;
    }
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();

    const nav = history.state;
    if (nav.storeId) {
      this.storeId   = nav.storeId;
      this.storeName = nav.storeName || '';
    }

    this.selectedVoucher = this.cartService.selectedVoucher();

    this.loadVouchers();
    if (this.isLoggedIn) this.loadMyVouchers();
  }

  loadVouchers() {
    this.isLoading = true;
    const url = this.storeId
      ? `${environment.apiUrl}/vouchers?store_id=${this.storeId}`
      : `${environment.apiUrl}/vouchers`;

    this.http.get(url).subscribe({
      next: (res: any) => {
        this.vouchers  = res.data || [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadMyVouchers() {
    const token = localStorage.getItem('token');
    if (!token) return;
    this.http.get(
      `${environment.apiUrl}/vouchers/my-vouchers`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: (res: any) => { this.myVouchers = res.data || []; },
      error: () => {}
    });
  }


  closeLoginPopup() {

    this.location.back();
  }


  goToLogin() {
    this.showLoginPopup = false;
    this.router.navigate(['/auth/login'], {
      queryParams: { redirectTo: '/voucher' }
    });
  }

  claimVoucher(voucher: any) {
    if (!this.isLoggedIn) { this.showLoginPopup = true; return; }
    const token = localStorage.getItem('token');
    this.claimingId = voucher.id;
    this.http.post(
      `${environment.apiUrl}/vouchers/${voucher.id}/claim`,
      {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: () => {
        this.claimingId = null;
        this.showAlert('Voucher berhasil diklaim! 🎉', true);
        this.loadVouchers();
        this.loadMyVouchers();
      },
      error: (err) => {
        this.claimingId = null;
        this.showAlert(err.error?.message || 'Gagal mengklaim voucher', false);
      }
    });
  }


  useVoucher(voucher: any) {
    const voucherData = {
      id:    voucher.id,
      code:  voucher.code,
      title: this.formatDiscount(voucher) + ' - ' + (voucher.name || voucher.code),
      discount_type:  voucher.discount_type,
      discount_value: voucher.discount_value
    };

 
    this.cartService.applyVoucher(voucherData);


    this.selectedVoucher = voucherData;

    this.showAlert(`Voucher ${voucher.code} dipakai ✅`, true);


    setTimeout(() => {
      this.location.back(); 
    }, 1200);
  }

  isActive(voucher: any): boolean {
    return this.selectedVoucher?.id === voucher.id;
  }

  isClaimed(voucher: any): boolean {
    return this.myVouchers.some(
      mv => (mv.voucher_id || mv.voucher?.id) === voucher.id
    );
  }

  formatDiscount(voucher: any): string {
    if (voucher.discount_type === 'percentage') return `${voucher.discount_value}%`;
    return 'Rp' + Number(voucher.discount_value).toLocaleString('id-ID');
  }

  formatMinTrx(v: any): string {
    if (!v.minimum_transaction || v.minimum_transaction <= 0) return 'Tanpa minimal';
    return 'Min. Rp' + Number(v.minimum_transaction).toLocaleString('id-ID');
  }

  formatExpiry(v: any): string {
    if (!v.expired_at) return 'Tidak ada batas';
    return new Date(v.expired_at).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  isExpired(v: any): boolean {
    if (!v.expired_at) return false;
    return new Date(v.expired_at) < new Date();
  }

  isQuotaHabis(v: any): boolean {
    return (v.used ?? 0) >= (v.quota ?? 0) && v.quota > 0;
  }

  showAlert(msg: string, ok: boolean) {
    this.popupMsg  = msg;
    this.popupOk   = ok;
    this.showPopup = true;
    setTimeout(() => { this.showPopup = false; }, 2200);
  }

  goBack() { this.location.back(); }

  get skeletonItems() { return Array(4).fill(0); }

}