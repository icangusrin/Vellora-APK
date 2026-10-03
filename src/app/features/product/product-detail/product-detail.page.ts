import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import { environment } from 'src/environments/environment';

import {
  arrowBackOutline,
  shareSocialOutline,
  cartOutline,
  chevronForwardOutline,
  chatbubbleOutline,
  closeOutline,
  starOutline,
  star,
  cubeOutline
} from 'ionicons/icons';

import {
  ChatService
} from '../../../core/services/chat.service';

import {
  ReviewService
} from '../../../core/services/review.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})

export class ProductDetailPage
implements OnInit {

  product: any;

  shop: any;

  productDescription = '';

  selectedVariant = 'Default';

  showVariants = false;

  variants: string[] = [];

  category = 'Produk';

  showFullDescription = false;

  productName = '';

  reviews: any[] = [];

  isLoadingReviews = false;

  ratingAvg: number | null = null;

  ratingCount = 0;

  ratingDist: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  readonly stars = [1, 2, 3, 4, 5];


  toastVisible = false;
  toastMessage = '';
  private toastTimer: any;

  constructor(
    private location: Location,
    private router: Router,
    private chatService: ChatService,
    private reviewService: ReviewService
  ) {

    addIcons({
      arrowBackOutline,
      shareSocialOutline,
      cartOutline,
      chevronForwardOutline,
      chatbubbleOutline,
      closeOutline,
      starOutline,
      star,
      cubeOutline
    });

  }

  ngOnInit() {

    const nav = history.state;

    if (!nav.product) return;

    const data = nav.product;

    this.product = {

      ...data,

      image:
        data.image
          ? data.image
          : data.images?.length > 0
            ? `${environment.baseUrl}/product_images/` +
              data.images[0].image
            : 'https://picsum.photos/300',

      name:
        data.product_name ||
        data.name ||
        'Produk',

      rawPrice: Number(data.rawPrice || data.price),

      price:
        data.price_format ||
        ('Rp' +
          Number(data.rawPrice || data.price)
            .toLocaleString('id-ID')),

      stock:
        data.stock ??
        data.quantity ??
        data.stock_qty ??
        null

    };

    this.shop = data.store
      ? {
          id: data.store.id,
          store_id: data.store.id,
          user_id: data.store.user_id,
          name: data.store.store_name,
          store_name: data.store.store_name,
          phone_number: data.store.phone_number || '',
          avatar: data.store.store_logo
          ? `${environment.baseUrl}/` + data.store.store_logo
            : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
        }
      : data.shop || {
          id: null,
          name: 'Toko',
          avatar: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
        };

    this.category =
      data.category?.category_name ||
      data.category ||
      'Produk';

    this.productDescription =
      data.description || 'Tidak ada deskripsi';

    this.variants = [];

    if (Array.isArray(data.variants) && data.variants.length > 0) {

      for (const v of data.variants) {

        this.variants.push(
          typeof v === 'string' ? v : String(v.variant_name)
        );

      }

    } else {

      this.variants.push('Default');

    }

    this.selectedVariant = this.variants[0];

    this.productName = this.product?.name || 'Produk';

    this.ratingAvg   = data.rating_avg   ? parseFloat(data.rating_avg)  : null;
    this.ratingCount = data.rating_count  ? parseInt(data.rating_count)  : 0;

    if (this.product?.id) {
      this.loadReviews();
    }

  }

  loadReviews() {

    this.isLoadingReviews = true;

    this.reviewService.getProductReviews(this.product.id).subscribe({

      next: (res: any) => {

        this.reviews = res.data ?? [];

        this.ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        for (const rv of this.reviews) {
          if (this.ratingDist[rv.rating] !== undefined) {
            this.ratingDist[rv.rating]++;
          }
        }

        this.isLoadingReviews = false;

      },

      error: () => {
        this.isLoadingReviews = false;
      }

    });

  }

  getBarPct(starValue: number): number {

    if (!this.reviews.length) return 0;

    return Math.round(
      (this.ratingDist[starValue] / this.reviews.length) * 100
    );

  }


  get variantTitle(): string {

    return this.selectedVariant || 'Pilih Varian';

  }


  openChat() {

    this.startChat();

  }


  confirmAddToCart() {

    this.addToCart();
    this.showVariants = false; 

  }


  startChat() {

    if (!this.product?.store?.user_id) {

      console.log('USER ID TOKO TIDAK ADA');

      return;

    }

    this.chatService.createRoom({

      seller_id: this.product.store.user_id,

      product_id: this.product.id

    }).subscribe({

      next: (res: any) => {

        const roomId = res.data.id;

        this.router.navigate(
          ['/chat-detail', roomId],
          {
            state: {
              chatData: {
                name: this.shop?.store_name || this.shop?.name,
                avatar: this.shop?.avatar
              }
            }
          }
        );

      },

      error: (err) => {

        console.log('CREATE ROOM ERROR', err);

      }

    });

  }


  addToCart() {
  
    const productCart = {
      id:           this.product.id + '-' + this.selectedVariant,
      product_id:   this.product.id,
      store_id:     this.shop?.id,
      name:         this.product.name,
      price:        this.product.rawPrice,
      price_format: this.product.price,
      image:        this.product.image,
      category:     this.category,
      variant:      this.selectedVariant,
      qty:          1,
      checked:      false,
      shop:         this.shop
    };
  
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
    const index = cart.findIndex((item: any) => item.id === productCart.id);
  
    if (index !== -1) {
      cart[index].qty += 1;
    } else {
      cart.push(productCart);
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


  buyNow() {

    const item = {

      id: this.product.id + '-' + this.selectedVariant,

      product_id: this.product.id,

      store_id: this.shop?.id,

      name: this.product.name,

      price: this.product.rawPrice,

      price_format: this.product.price,

      image: this.product.image,

      category: this.category,

      variant: this.selectedVariant,

      qty: 1,

      checked: true,

      shop: this.shop

    };

    localStorage.setItem(
      'checkoutItems',
      JSON.stringify([item])
    );

    localStorage.setItem(
      'checkoutTotal',
      this.product.rawPrice.toString()
    );

    this.router.navigate(['/checkout']);

  }


  toggleVariants() {

    this.showVariants = !this.showVariants;

  }

  selectVariant(variant: string) {

    this.selectedVariant = variant;

    this.showVariants = false;

  }


  toggleDescription() {

    this.showFullDescription = !this.showFullDescription;

  }


  goBack() {

    this.location.back();

  }

  goToCart() {

    this.router.navigate(['/cart']);

  }

  goToShop() {

    this.router.navigate(['/shop-profile'], {
      state: { shop: this.shop }
    });

  }


  async shareProduct() {

    if (navigator.share) {

      await navigator.share({
        title: this.productName,
        text: 'Lihat produk ini!',
        url: window.location.href
      });

    } else {

      await navigator.clipboard.writeText(
        window.location.href
      );

    }

  }

}