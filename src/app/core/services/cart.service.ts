import {
  Injectable,
  signal,
  computed
} from '@angular/core';

import { CartItem, Voucher } from '../../models/cart.model';
import { environment } from 'src/environments/environment';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})

export class CartService {

  private cartItemsSignal =
    signal<CartItem[]>(
      this.loadCartFromStorage()
    );

  private selectedVoucherSignal =
    signal<Voucher | null>(
      this.loadVoucherFromStorage()
    );

  readonly cartItems =
    this.cartItemsSignal.asReadonly();

  readonly selectedVoucher =
    this.selectedVoucherSignal.asReadonly();


  readonly totalItemsCount = computed(() =>
    this.cartItemsSignal().reduce(
      (acc, item) => acc + item.qty, 0
    )
  );

  loadFromStorage() {
    const raw = localStorage.getItem('cart');
    const items = raw ? JSON.parse(raw) : [];
    this.cartItemsSignal.set(items);  
  }


  readonly selectedItems = computed(() =>
    this.cartItemsSignal().filter(
      item => item.checked
    )
  );


  readonly selectedCount = computed(() =>
    this.selectedItems().length
  );


  readonly selectedTotalPrice = computed(() => {

    const total =
      this.selectedItems().reduce((acc, item) => {

        const priceVal =
          this.parsePrice(item.price);

        return acc + (priceVal * item.qty);

      }, 0);

    return this.applyVoucherDiscount(
      total,
      this.selectedVoucherSignal()
    );

  });

  constructor() {}



  addToCart(
    product: any,
    variant: string = 'Default'
  ) {

   
    const productName =
      product.product_name ||
      product.name ||
      'Produk';


    let price: number =
      product.rawPrice ||
      (typeof product.price === 'number'
        ? product.price
        : this.parsePrice(product.price)) ||
      0;

    const weight =
      product.weight ||
      (product.weightByVariant?.[variant]) ||
      1;


    const image =
      product.image
        ? product.image
        : product.images &&
          product.images.length > 0
          ? (
              product.images[0].image.startsWith('http')
                ? product.images[0].image
                : `${environment.baseUrl}/product_images/` +
                  product.images[0].image
            )
          : 'https://picsum.photos/300';


    const shop =
      product.store
        ? {
            id: product.store.id,
            name: product.store.store_name,
            avatar: product.store.store_logo
              ? `${environment.baseUrl}/` +
                product.store.store_logo
              : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
          }
        : product.shop ||
          { id: null, name: 'Toko' };


    let variants: string[] =
      product.variants
        ? Array.isArray(product.variants)
          ? product.variants.map(
              (v: any) =>
                typeof v === 'string'
                  ? v
                  : v.variant_name
            )
          : ['Default']
        : ['Default'];


    if (
      product.variantPrices &&
      product.variantPrices[variant]
    ) {

      price = product.variantPrices[variant];

    }


    const itemId =
      (product.id
        ? product.id + '-'
        : productName + '-') +
      variant;


    const currentItems = [
      ...this.cartItemsSignal()
    ];

    const existingIndex =
      currentItems.findIndex(
        item => item.id === itemId
      );

    if (existingIndex > -1) {


      currentItems[existingIndex] = {
        ...currentItems[existingIndex],
        qty: currentItems[existingIndex].qty + 1
      };

    } else {


      currentItems.unshift({
        id: itemId,
        product_id: product.id || null,
        name: productName,
        image,
        price,
        category:
          product.category?.category_name ||
          product.category ||
          'Produk',
        variant,
        variants,
        qty: 1,
        checked: false,
        weight,
        shop
      });

    }

    this.updateState(currentItems);

  }


  removeItem(itemId: string) {

    const filtered =
      this.cartItemsSignal().filter(
        item => item.id !== itemId
      );

    this.updateState(filtered);

  }


  removeCheckedItems() {

    const updated =
      this.cartItemsSignal().filter(
        item => !item.checked
      );

    this.updateState(updated);

  }


  increaseQty(itemId: string) {

    const updated =
      this.cartItemsSignal().map(item => {

        if (item.id === itemId) {

          return { ...item, qty: item.qty + 1 };

        }

        return item;

      });

    this.updateState(updated);

  }


  decreaseQty(itemId: string) {

    const updated =
      this.cartItemsSignal().map(item => {

        if (
          item.id === itemId &&
          item.qty > 1
        ) {

          return { ...item, qty: item.qty - 1 };

        }

        return item;

      });

    this.updateState(updated);

  }



  toggleItemChecked(itemId: string) {

    const updated =
      this.cartItemsSignal().map(item => {

        if (item.id === itemId) {

          return { ...item, checked: !item.checked };

        }

        return item;

      });

    this.updateState(updated);

  }

  changeVariant(
    itemId: string,
    newVariant: string
  ) {

    const currentItems = [
      ...this.cartItemsSignal()
    ];

    const itemIndex =
      currentItems.findIndex(
        item => item.id === itemId
      );

    if (itemIndex === -1) return;

    const item = currentItems[itemIndex];

    const baseName =
      item.id.split('-')[0] ||
      item.name;

    const newId =
      baseName + '-' + newVariant;

    const duplicateIndex =
      currentItems.findIndex(
        i => i.id === newId && i !== item
      );

    if (duplicateIndex > -1) {

      currentItems[duplicateIndex].qty +=
        item.qty;

      currentItems.splice(itemIndex, 1);

    } else {

      currentItems[itemIndex] = {
        ...item,
        id: newId,
        variant: newVariant
      };

    }

    this.updateState(currentItems);

  }


  toggleSelectAll(checked: boolean) {

    const updated =
      this.cartItemsSignal().map(
        item => ({ ...item, checked })
      );

    this.updateState(updated);

  }


  toggleStoreChecked(
    shopName: string,
    checked: boolean
  ) {

    const updated =
      this.cartItemsSignal().map(item => {

        if (item.shop?.name === shopName) {

          return { ...item, checked };

        }

        return item;

      });

    this.updateState(updated);

  }


  applyVoucher(voucher: Voucher) {

    this.selectedVoucherSignal.set(voucher);

    localStorage.setItem(
      'selectedVoucher',
      JSON.stringify(voucher)
    );

  }


  removeVoucher() {

    this.selectedVoucherSignal.set(null);

    localStorage.removeItem('selectedVoucher');

  }


  proceedToCheckout() {

    const selected = this.selectedItems();

    if (selected.length === 0) return false;

    localStorage.setItem(
      'checkoutItems',
      JSON.stringify(selected)
    );

    localStorage.setItem(
      'checkoutTotal',
      'Rp.' +
      Math.floor(
        this.selectedTotalPrice()
      ).toLocaleString('id-ID')
    );

    return true;

  }


  clearCart() {

    this.updateState([]);

    localStorage.removeItem('cart');

  }


  parsePrice(price: string | number): number {

    if (typeof price === 'number') return price;

    return Number(
      price
        .toString()
        .replace('Rp.', '')
        .replace('Rp', '')
        .replace(/\./g, '')
        .replace(/,/g, '')
        .trim()
    ) || 0;

  }


  formatRupiah(num: number): string {

    return 'Rp.' +
      Math.floor(num).toLocaleString('id-ID');

  }


  private applyVoucherDiscount(
    total: number,
    voucher: Voucher | null
  ): number {

    if (!voucher || total === 0) return total;

    let discounted = total;

    const title = voucher.title;

    if (title.includes('Diskon Rp')) {

      const discount = Number(
        title
          .replace('Diskon Rp', '')
          .replace(/\./g, '')
      );

      discounted -= discount;

    } else if (title.includes('Cashback')) {

      const percent = Number(
        title
          .replace('Cashback', '')
          .replace('%', '')
      );

      discounted -= total * (percent / 100);

    }

    return Math.max(0, discounted);

  }


  private loadCartFromStorage(): CartItem[] {

    const saved =
      localStorage.getItem('cart');

    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }

  }

  private loadVoucherFromStorage(): Voucher | null {

    const saved =
      localStorage.getItem('selectedVoucher');

    if (!saved) return null;

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }

  }


  private updateState(items: CartItem[]) {

    this.cartItemsSignal.set(items);

    localStorage.setItem(
      'cart',
      JSON.stringify(items)
    );

  }

}