import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { environment } from 'src/environments/environment';

import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import {
  searchOutline, cartOutline, ticketOutline,
  shirtOutline, sparklesOutline, desktopOutline,
  fastFoodOutline, bagAddOutline, wineOutline,
  fitnessOutline, barbellOutline, closeOutline, star
} from 'ionicons/icons';

import { addIcons } from 'ionicons';

import { CartService }    from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';

const BASE_URL = environment.baseUrl;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterLink,
    FormsModule,
    HttpClientModule
  ]
})
export class HomePage implements OnInit {

  private router          = inject(Router);
  private cartService     = inject(CartService);
  private productService  = inject(ProductService);
  toastVisible  = false;
  toastMessage  = '';
  private toastTimer: any;

  apiProducts: any[] = [];

  isLoading = false;

  showCartPopup  = false;


  constructor() {
    addIcons({
      searchOutline, cartOutline, ticketOutline,
      shirtOutline, sparklesOutline, desktopOutline,
      fastFoodOutline, bagAddOutline, wineOutline,
      fitnessOutline, barbellOutline, closeOutline, star
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;

    this.productService.getProducts().subscribe({
      next: (res: any) => {
        this.apiProducts = res.data?.data || res.data || [];
        this.isLoading   = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getImageUrl(product: any): string {
    if (!product.images || product.images.length === 0) {
      return 'https://picsum.photos/300';
    }

    const img = product.images[0].image;

    if (!img) return 'https://picsum.photos/300';

    if (img.startsWith('http')) return img;

    if (img.includes('product_images/')) {
      return `${BASE_URL}/${img}`;
    }

    return `${BASE_URL}/product_images/${img}`;
  }

  goToCategory(category: string) {
    this.router.navigate(['/search'], {
      queryParams: { category }
    });
  }

  goToCart()    { this.router.navigate(['/cart']); }
  goToVoucher() { this.router.navigate(['/voucher']); }

  openDetail(product: any) {
    let variants: string[] = [];

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      variants = product.variants.map((v: any) =>
        typeof v === 'string' ? v : v.variant_name
      );
    } else {
      variants = ['Default'];
    }

    this.router.navigate(['/product-detail'], {
      state: {
        product: {
          ...product,
          image: this.getImageUrl(product),
          variants
        }
      }
    });
  }

  addToCart(product: any, event: Event) {
    event.stopPropagation();

    this.showCartPopup   = true;

    const imgUrl = this.getImageUrl(product);

    const cartItem = {
      id:          `${product.id}-Default`,
      product_id:  product.id,
      store_id:    product.store?.id,
      name:        product.product_name || product.name,
      price:       Number(product.price),
      price_format:`Rp${Number(product.price).toLocaleString('id-ID')}`,
      image:       imgUrl,
      category:    product.category?.category_name || 'Produk',
      qty:         1,
      checked:     false,
      shop: product.store
        ? { id: product.store.id, name: product.store.store_name }
        : { id: null, name: 'Toko' }
    };

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex((i: any) => i.id === cartItem.id);

    if (idx !== -1) {
      cart[idx].qty += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    this.showToast('Produk ditambahkan ke keranjang 🛒');
  }

  // confirmAddToCart() {  // FUTURE UPDATE
  //   ...
  // }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 2000);
  }

  formatPrice(price: any): string {
    return 'Rp' + Number(price).toLocaleString('id-ID');
  }

  get skeletonItems() {
    return Array(8).fill(0);
  }

}