import { Product } from './product.model';

export interface WishlistItem {
  id?: string;
  userEmail: string;
  productId: string;
  product: Product;
}