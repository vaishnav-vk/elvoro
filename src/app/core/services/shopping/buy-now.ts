import { Injectable,inject } from '@angular/core';
import { CartItem } from '../../models/product.model';

@Injectable({
    providedIn:'root'
})
export class BuyNowService {
     private readonly storageKey = 'elvoroBuyNow';

  setBuyNowItem(item: CartItem): void {
    sessionStorage.setItem(
      this.storageKey,
      JSON.stringify(item)
    );
  }

  getBuyNowItem(): CartItem | null {
    const item = sessionStorage.getItem(this.storageKey);

    return item ? JSON.parse(item) as CartItem : null;
  }

  clearBuyNowItem(): void {
    sessionStorage.removeItem(this.storageKey);
  }
}
