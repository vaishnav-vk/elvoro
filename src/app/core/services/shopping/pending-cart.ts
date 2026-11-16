import { Injectable } from '@angular/core';
import { Product } from '../../models/product.model';
export interface PendingCartItem {
  product: Product;
  size: number;
}

@Injectable({
    providedIn:'root'
})
export class PendingCartService {
     private storageKey = 'elvoroPendingCart';

  save(product: Product, size: number): void {
    const item: PendingCartItem = { product, size };

    sessionStorage.setItem(
      this.storageKey,
      JSON.stringify(item)
    );
  }

  get(): PendingCartItem | null {
    const data = sessionStorage.getItem(this.storageKey);

    return data ? JSON.parse(data) : null;
  }

  clear(): void {
    sessionStorage.removeItem(this.storageKey);
  }
}
