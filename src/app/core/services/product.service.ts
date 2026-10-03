import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get(`${this.apiUrl}/products`);
  }

  resolveApiProduct(apiProduct: any): any {
    let variants: string[] = [];

    if (Array.isArray(apiProduct.variants) && apiProduct.variants.length > 0) {
      variants = apiProduct.variants.map((item: any) => item.variant_name);
    } else {
      variants = ['Default'];
    }

    const image =
      apiProduct.images && apiProduct.images.length > 0
        ? `${environment.baseUrl}/product_images/` + apiProduct.images[0].image
        : 'https://picsum.photos/300';

    return {
      ...apiProduct,
      name: apiProduct.product_name || apiProduct.name || 'Produk',
      image,
      rawPrice: Number(apiProduct.price),
      price_format: 'Rp' + Number(apiProduct.price).toLocaleString('id-ID'),
      variants,
      shop: apiProduct.store
        ? {
            id: apiProduct.store.id,
            name: apiProduct.store.store_name,
            user_id: apiProduct.store.user_id,
            avatar: apiProduct.store.store_logo
              ? `${environment.baseUrl}/` + apiProduct.store.store_logo
              : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
          }
        : { id: null, name: 'Toko' }
    };
  }
}