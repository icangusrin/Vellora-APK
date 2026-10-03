import { Shop } from './product.model';

export interface CartItem {
  id: string;
  product_id?: string;
  name: string;
  price: string | number;
  image: string;
  category?: string;
  variant: string;
  variants?: string[];
  qty: number;
  checked: boolean;
  weight?: number;
  shop?: Shop;
}

export interface Voucher {
  id: number;
  title: string;
  minTransaction?: number;
}
