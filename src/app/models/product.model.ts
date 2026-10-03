export interface Shop {
  id: number;
  name: string;
  avatar: string;
}

export interface Product {
  id?: string;
  name: string;
  image: string;
  price: string | number;
  sold?: string;
  soldText?: string;
  rating?: string | number;
  category?: string;
  variants?: string[];
  variantPrices?: Record<string, string | number>;
  weightByVariant?: Record<string, number>;
  weight?: number;
  shop?: Shop;
}
