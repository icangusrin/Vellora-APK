import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, chevronForwardOutline,
  locationOutline, receiptOutline,
  businessOutline, ticketOutline, qrCodeOutline
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule]
})
export class CheckoutPage {

  checkoutItems:   any[]    = [];
  selectedAddress: any      = null;
  selectedVoucher: any      = null;
  selectedPayment  = '';
  selectedBank     = '';
  isCodSelected    = false;
  isLoading        = false;
  errorMsg         = '';

  // Biaya admin dari DompetX
  // QRIS   : 0.7% + Rp500
  // VA BCA  : 0% + Rp4.300
  // VA BRI  : 0% + Rp3.000
  // VA Mandiri: 0% + Rp2.900
  gatewayFee       = 0;

  toastVisible = false;
  toastMessage = '';
  private toastTimer: any;

  constructor(
    private location: Location,
    private router:   Router,
    private http:     HttpClient
  ) {
    addIcons({
      'arrow-back-outline':      arrowBackOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'location-outline':        locationOutline,
      'receipt-outline':         receiptOutline,
      'business-outline':        businessOutline,
      'ticket-outline':          ticketOutline,
      'qr-code-outline':         qrCodeOutline
    });
  }

  ionViewWillEnter() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showToast('Kamu perlu login dulu untuk checkout');
      setTimeout(() => this.router.navigate(['/auth/login'], { replaceUrl: true }), 1200);
      return;
    }

    const items = localStorage.getItem('checkoutItems');
    if (items) {
      this.checkoutItems = JSON.parse(items).map((item: any) => ({
        id:         item.id,
        product_id: item.product_id || null,
        name:       item.name,
        price:      typeof item.price === 'number' ? item.price : this.parsePrice(item.price),
        image:      item.image,
        qty:        item.qty,
        variant:    item.variant,
        weight:     item.weight || 1,
        store_id:   item.shop?.id || null,
        shop:       item.shop || { name: 'Toko' }
      }));
    }

    if (!this.checkoutItems || this.checkoutItems.length === 0) {
      this.router.navigate(['/cart'], { replaceUrl: true });
      return;
    }

    this.selectedPayment = '';
    this.selectedBank    = '';
    this.isCodSelected   = false;
    this.gatewayFee      = 0;

    const payment = localStorage.getItem('selectedPayment');
    const bank    = localStorage.getItem('selectedBank');
    if (payment) {
      this.selectedPayment = payment;
      this.isCodSelected   = payment === 'COD';
    }
    if (bank) this.selectedBank = bank;


    this.hitungGatewayFee();

    const voucher = localStorage.getItem('selectedVoucher');
    this.selectedVoucher = voucher ? JSON.parse(voucher) : null;

    this.loadAndValidateAddress();
  }

  loadAndValidateAddress() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get(
      `${environment.apiUrl}/addresses`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: (res: any) => {
        const addresses = res.data || [];

        const saved = localStorage.getItem('checkoutAddress');
        if (saved) {
          const parsed  = JSON.parse(saved);

          const stillExists = addresses.find((a: any) => a.id === parsed.id);
          if (stillExists) {
            this.selectedAddress = stillExists; // pakai data fresh dari API
            localStorage.setItem('checkoutAddress', JSON.stringify(stillExists));
            return;
          }

          localStorage.removeItem('checkoutAddress');
        }


        const def = addresses.find((a: any) => {
          return a.is_default === true || a.is_default === 1 || String(a.is_default) === '1' || String(a.is_default) === 'true';
        }) || addresses[0] || null;
        this.selectedAddress = def;
        if (def) {
          localStorage.setItem('checkoutAddress', JSON.stringify(def));
        }
      },
      error: () => {}
    });
  }

  /*
  ===========================
  HITUNG BIAYA GATEWAY
  Sesuai tarif DompetX yang aktif:
  - QRIS    : 0.7% + Rp500
  - VA BCA  : 0% + Rp4.300
  - VA BRI  : 0% + Rp3.000
  - VA Mandiri: 0% + Rp2.900
  - COD     : gratis
  ===========================
  */
  hitungGatewayFee() {
    const subtotal = this.getProductSubtotalNumber();
    const shipping = this.getShippingCostNumber();
    const base     = subtotal + shipping - this.getDiscountAmount();

    if (this.selectedPayment === 'QRIS') {
      this.gatewayFee = Math.ceil(base * 0.007) + 500;
      return;
    }

    if (this.selectedPayment === 'Transfer Bank') {
      const feeMap: Record<string, number> = {
        'BCA':     4300,
        'BRI':     3000,
        'Mandiri': 2900,
      };
      this.gatewayFee = feeMap[this.selectedBank] ?? 0;
      return;
    }

    this.gatewayFee = 0;
  }

  goToAddress() {
    localStorage.setItem('addressMode', 'select');
    this.router.navigate(['/my-address']);
  }

  goToVoucher()       { this.router.navigate(['/voucher']); }
  goToPaymentMethod() { this.router.navigate(['/checkout/payment-method']); }

  selectCod() {
    this.isCodSelected   = true;
    this.selectedPayment = 'COD';
    this.selectedBank    = '';
    this.gatewayFee      = 0;
    localStorage.setItem('selectedPayment', 'COD');
    localStorage.removeItem('selectedBank');
  }

 
  createOrder() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.showToast('Sesi kamu habis, silakan login ulang');
      setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      return;
    }

    if (!this.selectedAddress) { this.errorMsg = 'Pilih alamat pengiriman terlebih dahulu'; return; }
    if (!this.selectedPayment) { this.errorMsg = 'Pilih metode pembayaran terlebih dahulu'; return; }
    if (this.selectedPayment === 'Transfer Bank' && !this.selectedBank) {
      this.errorMsg = 'Pilih bank tujuan transfer'; return;
    }

    this.isLoading = true;
    this.errorMsg  = '';

    const payload: any = {
      items:          this.checkoutItems,
      address_id:     this.selectedAddress.id,
      payment_method: this.selectedPayment,
      bank_name:      this.selectedBank || null,
    };

    if (this.selectedVoucher?.code) {
      payload.voucher_code = this.selectedVoucher.code;
    }

    this.http.post(
      `${environment.apiUrl}/checkout`,
      payload,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data     = res.data;

        localStorage.setItem('lastOrderId',   String(data.order_id));
        localStorage.setItem('lastPaymentId', String(data.payment_id));
        localStorage.setItem('checkoutTotal', 'Rp.' + Number(data.total).toLocaleString('id-ID'));

        const checkoutIds = this.checkoutItems.map(i => i.id);
        const cart        = JSON.parse(localStorage.getItem('cart') || '[]');
        localStorage.setItem('cart', JSON.stringify(cart.filter((c: any) => !checkoutIds.includes(c.id))));
        localStorage.removeItem('checkoutItems');
        localStorage.removeItem('selectedPayment');
        localStorage.removeItem('selectedBank');
        localStorage.removeItem('selectedVoucher');
        localStorage.removeItem('checkoutAddress');


        const totalFormatted = 'Rp.' + Number(data.total).toLocaleString('id-ID');
        const totalWithFee   = this.getFinalTotal();
        localStorage.setItem('checkoutTotal', totalWithFee);

        if (data.payment_method === 'COD') {
          this.router.navigate(['/checkout/success-order'], {
            replaceUrl: true,
            state: { orderId: data.order_id }
          });

        } else if (data.payment_method === 'QRIS') {
          this.router.navigate(['/checkout/payment-qris'], {
            replaceUrl: true,
            state: {
              orderId:        data.order_id,
              paymentId:      data.payment_id,
              total:          totalWithFee,
              expiredAtMs:    data.expired_at_ms,
              qrisImageUrl:   data.qris_image_url,
              subtotal:       this.getProductSubtotalNumber(),
              shippingCost:   this.getShippingCostNumber(),
              discount:       this.getDiscountAmount(),
              gatewayFee:     this.gatewayFee,
            }
          });

        } else {
          this.router.navigate(['/checkout/pending-payment'], {
            replaceUrl: true,
            state: {
              orderId:     data.order_id,
              paymentId:   data.payment_id,
              total:       totalFormatted,
              bank:        data.bank_name,
              method:      data.payment_method,
              expiredAtMs: data.expired_at_ms,
              vaNumber:    data.va_number,
            }
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg  = err.error?.message || 'Gagal membuat pesanan, coba lagi';
      }
    });
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 2500);
  }


  parsePrice(val: any): number {
    if (typeof val === 'number') return val;
    return Number(
      val?.toString().replace(/Rp\.?/gi, '').replace(/\./g, '').replace(/,/g, '').trim()
    ) || 0;
  }

  getProductSubtotalNumber(): number {
    return this.checkoutItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
  }

  getProductTotal(): string {
    return 'Rp.' + this.getProductSubtotalNumber().toLocaleString('id-ID');
  }

  getShippingCostNumber(): number {
    const w = this.checkoutItems.reduce((s, i) => s + ((i.weight || 1) * i.qty), 0);
    if (this.selectedVoucher?.title?.includes('Gratis Ongkir')) return 0;
    return w <= 5 ? 2000 : 5000;
  }

  getShippingCost(): string {
    return 'Rp.' + this.getShippingCostNumber().toLocaleString('id-ID');
  }

  getDiscountAmount(): number {
    if (!this.selectedVoucher) return 0;
    const t = this.selectedVoucher.title || '';
    if (t.includes('Diskon Rp')) return Number(t.replace('Diskon Rp', '').replace(/\./g, '')) || 0;
    if (t.includes('Cashback')) {
      const pct = Number(t.replace('Cashback', '').replace('%', '')) || 0;
      return Math.floor((this.getProductSubtotalNumber() + this.getShippingCostNumber()) * (pct / 100));
    }
    if (t.includes('Gratis Ongkir')) return this.getShippingCostNumber();
    return 0;
  }

  getFinalTotalNumber(): number {
    return Math.max(0,
      this.getProductSubtotalNumber()
      + this.getShippingCostNumber()
      - this.getDiscountAmount()
      + this.gatewayFee
    );
  }

  getFinalTotal(): string {
    return 'Rp.' + this.getFinalTotalNumber().toLocaleString('id-ID');
  }

  getGatewayFeeLabel(): string {
    if (this.selectedPayment === 'QRIS')         return 'Biaya QRIS';
    if (this.selectedPayment === 'Transfer Bank') return `Biaya VA ${this.selectedBank}`;
    return 'Biaya Admin';
  }

  goBack() { this.location.back(); }
}