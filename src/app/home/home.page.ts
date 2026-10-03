import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CartService } from '../core/services/cart.service';

import {
  searchOutline,
  cartOutline,
  ticketOutline,
  shirtOutline,
  sparklesOutline,
  desktopOutline,
  fastFoodOutline,
  bagAddOutline,
} from 'ionicons/icons';

import { addIcons } from 'ionicons';
import { AddCartModalComponent } from '../shared/components/add-cart-modal/add-cart-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,

  imports: [
    IonicModule,
    CommonModule,
    RouterLink,
    AddCartModalComponent
  ],
})

export class HomePage {

  selectedTab = 'recommended';
  
  // MODAL STATE
  showAddCartModal = false;
  selectedProductForCart: any = null;
  variantsForCart: string[] = [];

  constructor(
    private router: Router,
    private cartService: CartService
  ) {

    addIcons({
      searchOutline,
      cartOutline,
      ticketOutline,
      shirtOutline,
      sparklesOutline,
      desktopOutline,
      fastFoodOutline,
      bagAddOutline,
    });

  }

  // GO TO CART
  goToCart() {

    this.router.navigate(['/cart']);

  }

  // GO TO CATEGORY
  goToCategory(category: string) {

    const route = category.toLowerCase();

    this.router.navigate([
      `/${route}`
    ]);

  }

  // GO TO VOUCHER
  goToVoucher() {

    this.router.navigate([
      '/voucher'
    ]);

  }

  // DETAIL PRODUCT
  openDetail(product: any) {

    // VARIANT OTOMATIS SESUAI PRODUK
    let variants: string[] = [];

    const productName =
      product.name.toLowerCase();

    // BEDAK
    if (
      productName.includes('bedak')
    ) {

      variants = [
        'Ivory',
        'Natural',
        'Beige',
        'Mocha'
      ];

    }

    // SMART WATCH
    else if (
      productName.includes('watch')
    ) {

      variants = [
        'Hitam',
        'Pink',
        'Putih',
        'Cream'
      ];

    }

    // SNACK / COOKIES
    else if (
      productName.includes('snack') ||
      productName.includes('cookies')
    ) {

      variants = [
        'Balado',
        'BBQ',
        'Keju',
        'Jagung Bakar'
      ];

    }

    // BRACELET
    else if (
      productName.includes('bracelet')
    ) {

      variants = [
        'Gold',
        'Silver',
        'Rose Gold'
      ];

    }

    // JEANS
    else if (
      productName.includes('jeans')
    ) {

      variants = [
        '28',
        '30',
        '32',
        '34'
      ];

    }

    // KAOS
    else if (
      productName.includes('kaos')
    ) {

      variants = [
        'S',
        'M',
        'L',
        'XL'
      ];

    }

    // HANDPHONE
    else if (
      productName.includes('handphone')
    ) {

      variants = [
        '128GB',
        '256GB',
        '512GB'
      ];

    }

    // DEFAULT
    else {

      variants = ['Default'];

    }

    // KIRIM KE DETAIL
    this.router.navigate(['/product-detail'], {
      state: {
        product: {
          ...product,
          variants
        }
      }
    });

  }

  // ADD TO CART
  addToCart(product: any, event: Event) {

    // BIAR TIDAK IKUT KLIK CARD
    event.stopPropagation();

    // GET VARIANTS UNTUK PRODUK
    const variants = this.getVariantsForProduct(product);

    // SET DATA MODAL
    this.selectedProductForCart = product;
    this.variantsForCart = variants;
    this.showAddCartModal = true;

  }

  // HELPER: GET VARIANTS UNTUK PRODUK
  private getVariantsForProduct(product: any): string[] {
    let variants: string[] = [];
    const productName = product.name.toLowerCase();

    if (productName.includes('bedak')) {
      variants = ['Ivory', 'Natural', 'Beige', 'Mocha'];
    } else if (productName.includes('watch')) {
      variants = ['Hitam', 'Pink', 'Putih', 'Cream'];
    } else if (productName.includes('snack') || productName.includes('cookies')) {
      variants = ['Balado', 'BBQ', 'Keju', 'Jagung Bakar'];
    } else if (productName.includes('bracelet')) {
      variants = ['Gold', 'Silver', 'Rose Gold'];
    } else if (productName.includes('jeans')) {
      variants = ['28', '30', '32', '34'];
    } else if (productName.includes('kaos')) {
      variants = ['S', 'M', 'L', 'XL'];
    } else if (productName.includes('handphone')) {
      variants = ['128GB', '256GB', '512GB'];
    } else if (productName.includes('lip')) {
      variants = ['Cherry Red', 'Soft Pink', 'Mocha', 'Nude'];
    } else if (productName.includes('face wash')) {
      variants = ['Acne Care', 'Brightening', 'Sensitive Skin', 'Oil Control'];
    } else if (productName.includes('skincare')) {
      variants = ['Glow Set', 'Acne Set', 'Hydrating Set', 'Whitening Set'];
    } else if (productName.includes('perfume')) {
      variants = ['Vanilla', 'Rose', 'Ocean Fresh', 'Sweet Floral'];
    } else {
      variants = ['Default'];
    }

    return variants;
  }

  // HANDLE ADD TO CART FROM MODAL
  onAddToCartFromModal(selectedVariant: string) {
    if (this.selectedProductForCart) {
      this.cartService.addToCart(this.selectedProductForCart, selectedVariant);
      this.closeAddCartModal();
    }
  }

  // CLOSE MODAL
  closeAddCartModal() {
    this.showAddCartModal = false;
    this.selectedProductForCart = null;
    this.variantsForCart = [];
  }

  // CATEGORY
  categories = [

    {
      name: 'Voucher',
      icon: 'ticket-outline',
    },

    {
      name: 'Fashion',
      icon: 'shirt-outline',
    },

    {
      name: 'Beauty',
      icon: 'sparkles-outline',
    },

    {
      name: 'Elektronik',
      icon: 'desktop-outline',
    },

    {
      name: 'Snack',
      icon: 'fast-food-outline',
    },

  ];

  // RECOMMENDED
  recommendedProducts = [

    {
      name: 'Bedak',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9',
      price: 'Rp.55.000',
      sold: '5RB+ terjual',
      rating: '⭐⭐⭐⭐⭐',
    },

    {
      name: 'Smart Watch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      price: 'Rp.200.000',
      sold: '500 terjual',
      rating: '⭐⭐⭐⭐☆',
    },

    {
      name: 'Snack',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff',
      price: 'Rp.25.000',
      sold: '2RB+ terjual',
      rating: '⭐⭐⭐⭐⭐',
    },

    {
      name: 'Bracelet',
      image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638',
      price: 'Rp.75.000',
      sold: '800 terjual',
      rating: '⭐⭐⭐⭐☆',
    },

  ];

  // HOT
  hotProducts = [

    {
      name: 'Jeans',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
      price: 'Rp.175.000',
      sold: '2RB+ terjual',
      rating: '⭐⭐⭐⭐⭐',
    },

    {
      name: 'Kaos',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      price: 'Rp.120.000',
      sold: '1RB+ terjual',
      rating: '⭐⭐⭐⭐☆',
    },

  ];

  // TOP
  topProducts = [

    {
      name: 'Handphone',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
      price: 'Rp.2.500.000',
      sold: '10RB+ terjual',
      rating: '⭐⭐⭐⭐⭐',
    },

    {
      name: 'Cookies',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
      price: 'Rp.35.000',
      sold: '4RB+ terjual',
      rating: '⭐⭐⭐⭐⭐',
    },

  ];

  // PRODUCT LIST
  get products() {

    if (this.selectedTab === 'hot') {

      return this.hotProducts;

    }

    if (this.selectedTab === 'top') {

      return this.topProducts;

    }

    return this.recommendedProducts;

  }

}