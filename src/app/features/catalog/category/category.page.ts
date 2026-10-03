import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  searchOutline,
  bagHandleOutline,
  star
} from 'ionicons/icons';

import { ProductService } from '../../../../services/product.service';
import { CartService } from '../../../../services/cart.service';
import { Product } from '../../../../models/product.model';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class CategoryPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  categoryName = '';
  searchText = '';
  products: Product[] = [];

  constructor() {
    addIcons({
      arrowBackOutline,
      searchOutline,
      bagHandleOutline,
      star
    });
  }

  ngOnInit() {
    // Ambil nama kategori dari data rute
    this.route.data.subscribe(data => {
      this.categoryName = data['category'] || 'Produk';
      this.loadProducts();
    });
  }

  loadProducts() {
    this.products = this.productService.getProductsByCategory(this.categoryName);
  }

  goBack() {
    this.router.navigate(['/tabs/home']);
  }

  searchProduct() {
    this.products = this.productService.searchProducts(this.searchText, this.categoryName);
  }

  openDetail(product: Product) {
    const resolvedProduct = this.productService.resolveProductDetails(product);
    this.router.navigate(['/product-detail'], {
      state: {
        product: resolvedProduct
      }
    });
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    const resolved = this.productService.resolveProductDetails(product);
    const defaultVariant = resolved.variants?.[0] || 'Default';
    this.cartService.addToCart(resolved, defaultVariant);
  }

  formatPrice(price: string | number): string {
    if (typeof price === 'number') {
      return this.cartService.formatRupiah(price);
    }
    return price;
  }
}
