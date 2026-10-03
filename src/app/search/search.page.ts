import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  searchOutline,
  trashOutline,
  closeOutline,
  bagAddOutline
} from 'ionicons/icons';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonContent,
    IonIcon
  ]
})
export class SearchPage implements OnInit {

  searchText = '';
  activeCategory = '';

  histories: string[] = [];
  filteredHistories: string[] = [];

  suggestions: any[] = [];

  products: any[] = [];

  isLoading = false;

  toastVisible  = false;
  toastMessage  = '';
  private toastTimer: any;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    addIcons({
      arrowBackOutline,
      searchOutline,
      trashOutline,
      closeOutline,
      bagAddOutline
    });
  }

  ngOnInit() {

    const saved = localStorage.getItem('searchHistory');
    this.histories = saved ? JSON.parse(saved) : [];
    this.filteredHistories = [...this.histories];

    this.route.queryParams.subscribe(params => {

      if (params['category']) {
        this.activeCategory = params['category'];
        this.searchText = '';
        this.searchByCategory(this.activeCategory);
      }

      if (params['q']) {
        this.searchText = params['q'];
        this.searchProduct();
      }

    });

  }

  goBack() {

    if (this.products.length > 0) {
      this.products = [];
      this.searchText = '';
      this.activeCategory = '';
      return;
    }

    if (this.suggestions.length > 0) {
      this.suggestions = [];
      this.searchText = '';
      return;
    }

    this.location.back();

  }

  searchByCategory(category: string) {

    this.isLoading = true;
    this.suggestions = [];

    this.http.get(`${environment.apiUrl}/products`).subscribe({

      next: (res: any) => {

        const all = res.data?.data || res.data || [];

        this.products = all
          .filter((item: any) => {
            const catName =
              item.category?.category_name || '';
            return catName.toLowerCase() === category.toLowerCase();
          })
          .map((item: any) => this.normalizeProduct(item));

        this.isLoading = false;

      },

      error: (err) => {
        console.log('CATEGORY SEARCH ERROR:', err);
        this.isLoading = false;
      }

    });

  }

 
  onTyping() {

    const keyword = this.searchText.trim();

    if (!keyword) {
      this.products = [];
      this.suggestions = [];
      this.activeCategory = '';
      this.filteredHistories = [...this.histories];
      return;
    }

    if (keyword.length < 2) {
      this.suggestions = [];
      return;
    }

    this.http.get(`${environment.apiUrl}/products`).subscribe({

      next: (res: any) => {

        const all = res.data?.data || res.data || [];

        this.suggestions = all.filter((item: any) =>
          item.product_name?.toLowerCase().includes(keyword.toLowerCase())
        );

      },

      error: (err) => console.log('SUGGESTION ERROR:', err)

    });

  }

  
  searchProduct() {

    const keyword = this.searchText.trim();

    if (!keyword) {
      this.products = [];
      return;
    }

    // Simpan history
    if (!this.histories.includes(keyword)) {
      this.histories.unshift(keyword);
    }
    localStorage.setItem('searchHistory', JSON.stringify(this.histories));
    this.filteredHistories = [...this.histories];
    this.suggestions = [];
    this.activeCategory = '';
    this.isLoading = true;

    this.http.get(`${environment.apiUrl}/products`).subscribe({

      next: (res: any) => {

        const all = res.data?.data || res.data || [];

        this.products = all
          .filter((item: any) =>
            item.product_name?.toLowerCase().includes(keyword.toLowerCase())
          )
          .map((item: any) => this.normalizeProduct(item));

        this.isLoading = false;

      },

      error: (err) => {
        console.log('SEARCH ERROR:', err);
        this.isLoading = false;
      }

    });

  }

  
  private normalizeProduct(item: any): any {
    const rawPrice = Number(item.price) || 0;
    return {
      ...item,
      title:        item.product_name,
      image:        item.images?.length > 0
        ? `${environment.baseUrl}/` + item.images[0].image
        : 'https://picsum.photos/300',
      rawPrice,
      price_format: 'Rp' + rawPrice.toLocaleString('id-ID'),
      price:        'Rp' + rawPrice.toLocaleString('id-ID'),
      sold:         'Terjual',
      shop: {
        id:      item.store?.id,
        name:    item.store?.store_name,
        user_id: item.store?.user_id,
        avatar:  item.store?.store_logo
          ? `${environment.baseUrl}/` + item.store.store_logo
          : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
      }
    };
  }

  openDetail(product: any) {
    this.router.navigate(['/product-detail'], {
      state: { product }
    });
  }

  openSuggestion(item: any) {
    this.searchText = item.product_name;
    this.searchProduct();
  }

  openHistorySearch(item: string) {
    this.searchText = item;
    this.searchProduct();
  }

  removeItem(index: number) {
    const item = this.filteredHistories[index];
    this.histories = this.histories.filter(h => h !== item);
    this.filteredHistories = [...this.histories];
    localStorage.setItem('searchHistory', JSON.stringify(this.histories));
  }

  clearAll() {
    this.histories = [];
    this.filteredHistories = [];
    localStorage.removeItem('searchHistory');
  }

  addToCart(product: any, event: Event) {

    event.stopPropagation();

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const productCart = {
      id:         product.id + '-Default',
      product_id: product.id,
      name:       product.title,
      image:      product.image,
      price:      product.price,
      qty:        1,
      checked:    false,
      shop:       product.shop
    };

    const idx = cart.findIndex((i: any) => i.id === productCart.id);
    if (idx !== -1) {
      cart[idx].qty += 1;
    } else {
      cart.push(productCart);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.showToast('Produk ditambahkan ke keranjang 🛒');

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