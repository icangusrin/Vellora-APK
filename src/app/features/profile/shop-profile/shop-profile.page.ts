import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ChatService }   from '../../../core/services/chat.service';
import { ReviewService } from '../../../core/services/review.service';

import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, searchOutline, ellipsisVerticalOutline,
  chevronForwardOutline, chevronDownOutline, chevronUpOutline,
  chatbubbleOutline, bagHandleOutline, bagAddOutline, personCircleOutline,
  shareSocialOutline, ticketOutline, star,
} from 'ionicons/icons';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-shop-profile',
  templateUrl: './shop-profile.page.html',
  styleUrls: ['./shop-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, IonContent, IonIcon],
})
export class ShopProfilePage implements OnInit {

  shop: any;

  activeFilter       = 'Populer';
  activeTab          = 'Produk';
  activeReviewFilter = 'Semua';

  searchText     = '';
  showMenu       = false;
  showOutOfStock = false;
  isLoading      = false;
  isLoadingReviews = false;

  products           : any[] = [];
  outOfStockProducts : any[] = [];
  reviews            : any[] = [];

  
  shopRatingAvg   = 0;
  shopRatingCount = 0;

  toastVisible = false;
  toastMessage = '';
  private toastTimer: any;

  constructor(
    private location      : Location,
    private router        : Router,
    private http          : HttpClient,
    private chatService   : ChatService,
    private reviewService : ReviewService,
  ) {
    addIcons({
      arrowBackOutline, searchOutline, ellipsisVerticalOutline,
      chevronForwardOutline, chevronDownOutline, chevronUpOutline,
      chatbubbleOutline, bagHandleOutline, bagAddOutline, personCircleOutline,
      shareSocialOutline, ticketOutline, star,
    });
  }

  ngOnInit() {
    const nav  = history.state;
    this.shop  = nav.shop || { name: 'Toko' };

    if (!this.shop.avatar && this.shop.store_logo) {
      this.shop.avatar = this.shop.store_logo.startsWith('http')
        ? this.shop.store_logo
        : `${environment.baseUrl}/` + this.shop.store_logo
    }

    this.loadProducts();
  }

  loadProducts() {
    const storeId = this.shop?.store_id || this.shop?.id;
    if (!storeId) { this.products = []; this.outOfStockProducts = []; return; }

    this.isLoading = true;

    this.http.get(`${environment.apiUrl}/stores/${storeId}/products`).subscribe({
      next: (res: any) => {
        const all = res.data || [];

        const mapped = all.map((item: any) => {
          const rawPrice = Number(item.price) || 0;
          return {
            ...item,
            name        : item.product_name,
            rawPrice,
            price_format: 'Rp' + rawPrice.toLocaleString('id-ID'),
            price       : 'Rp' + rawPrice.toLocaleString('id-ID'),
            sold        : '0 terjual',
            image       : item.images?.length > 0
              ? `${environment.baseUrl}/` + item.images[0].image
              : 'https://picsum.photos/300',
            shop        : this.shop,
            rating_avg  : item.rating_avg   ?? 0,
            rating_count: item.rating_count ?? 0,
          };
        });

        this.products          = mapped.filter((p: any) => p.stock > 0);
        this.outOfStockProducts = mapped.filter((p: any) => p.stock <= 0);
        this.isLoading          = false;
        this.loadStoreReviews(all.map((p: any) => p.id));
      },
      error: () => { this.isLoading = false; },
    });
  }

  // ─── LOAD REVIEWS TOKO ────────────────────────────────────────────────────
  /**
   * Fetch reviews dari semua produk toko, gabungkan, dan hitung
   * rata-rata rating toko secara keseluruhan.
   */
  loadStoreReviews(productIds: number[]) {
    if (!productIds.length) return;

    this.isLoadingReviews = true;
    const requests = productIds.map(id =>
      this.reviewService.getProductReviews(id).pipe(catchError(() => of({ data: [] })))
    );

    forkJoin(requests).subscribe({
      next: (results: any[]) => {
        const all: any[] = [];
        for (const r of results) all.push(...(r.data ?? []));

        this.reviews = all;

        if (all.length) {
          const sum = all.reduce((acc: number, rv: any) => acc + rv.rating, 0);
          this.shopRatingAvg   = Math.round((sum / all.length) * 10) / 10;
          this.shopRatingCount = all.length;
        }

        this.isLoadingReviews = false;
      },
      error: () => { this.isLoadingReviews = false; },
    });
  }

  goToVoucher() {
    this.router.navigate(['/voucher'], {
      state: {
        storeId  : this.shop?.store_id || this.shop?.id,
        storeName: this.shop?.store_name || this.shop?.name,
      },
    });
  }

  openChat() {
    const sellerId = this.shop?.user_id;
    if (!sellerId) return;

    this.chatService.createRoom({ seller_id: sellerId }).subscribe({
      next: (res: any) => {
        this.router.navigate(['/chat-detail', res.data.id], {
          state: {
            chatData: {
              name  : this.shop?.store_name || this.shop?.name,
              avatar: this.shop?.avatar,
            },
          },
        });
      },
      error: (err) => console.log('CREATE ROOM ERROR:', err),
    });
  }

  openProduct(product: any) {
    this.router.navigate(['/product-detail'], {
      state: {
        product: {
          ...product,
          store: {
            id          : this.shop?.id,
            user_id     : this.shop?.user_id,
            store_name  : this.shop?.store_name || this.shop?.name,
            phone_number: this.shop?.phone_number,
            store_logo  : this.shop?.avatar?.replace(`${environment.baseUrl}/`, '')
          },
        },
      },
    });
  }

  get filteredProducts() {
    return this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  goBack()                    { this.location.back(); }
  goHome()                    { this.showMenu = false; this.router.navigateByUrl('/tabs/home'); }
  changeFilter(f: string)     { this.activeFilter = f; }
  changeTab(t: string)        { this.activeTab = t; }
  changeReviewFilter(f: string) { this.activeReviewFilter = f; }
  toggleMenu()                { this.showMenu = !this.showMenu; }
  toggleOutOfStock()          { this.showOutOfStock = !this.showOutOfStock; }

  shareShop() {
    this.showMenu = false;
    if (navigator.share) {
      navigator.share({
        title: this.shop?.name,
        text : `Kunjungi toko ${this.shop?.name}`,
        url  : window.location.href,
      });
    }
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation(); 

    const cartItem = {
      id:           `${product.id}-Default`,
      product_id:   product.id,
      store_id:     this.shop?.store_id || this.shop?.id,
      name:         product.name,
      price:        Number(String(product.price).replace(/[^0-9]/g, '')),
      price_format: product.price,
      image:        product.image,
      category:     product.category?.category_name || 'Produk',
      variant:      'Default',
      qty:          1,
      checked:      false,
      shop: {
        id:   this.shop?.store_id || this.shop?.id,
        name: this.shop?.store_name || this.shop?.name,
      },
    };

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex((i: any) => i.id === cartItem.id);

    if (idx !== -1) {
      cart[idx].qty += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.showToast('Produk berhasil ditambahkan ke keranjang 🛒');
  }

  
  showToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 2000);
  }
}