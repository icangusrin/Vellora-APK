import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createReview(payload: {
    product_id    : number;
    order_id?     : number;
    order_item_id?: number;
    rating        : number;
    review?       : string;
  }): Observable<any> {
    return this.http.post(`${this.base}/reviews`, payload);
  }

  getEligibleItems(): Observable<any> {
    return this.http.get(`${this.base}/reviews/eligible-items`);
  }

  getMyReviews(): Observable<any> {
    return this.http.get(`${this.base}/reviews/my-reviews`);
  }

  getProductReviews(productId: number): Observable<any> {
    return this.http.get(`${this.base}/products/${productId}/reviews`);
  }

  formatPrice(price: any): string {
    return 'Rp' + Number(price).toLocaleString('id-ID');
  }

  starArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  resolveImage(images: any[]): string {
    if (!images?.length) return 'https://picsum.photos/300';
    const img = images[0].image;
    if (!img) return 'https://picsum.photos/300';
    return img.startsWith('http') ? img : `${environment.baseUrl}/${img}`;
  }

}