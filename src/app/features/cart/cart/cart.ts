import { Component,inject } from '@angular/core';
import { AsyncPipe,CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCartItems,selectCartTotal } from '../../../store/cart/cart.selectors';
import { increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart
 } from '../../../store/cart/cart.action';
 import { RouterLink } from '@angular/router';


@Component({
  imports: [AsyncPipe,CurrencyPipe,RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart {
  private store = inject(Store);

  items$ = this.store.select(selectCartItems);
  total$ = this.store.select(selectCartTotal);

  // Maximum quantity per product and size
  maxQuantity = 5;

  // Confirmation popup states
  showRemoveConfirmation = false;
  showClearConfirmation = false;

  // Selected product details
  selectedProductId: string | null = null;
  selectedSize: number | null = null;

  // Increase quantity with maximum limit
  increase(
    productId: string,
    size: number,
    currentQuantity: number
  ): void {

    if (currentQuantity >= this.maxQuantity) {
      return;
    }

    this.store.dispatch(increaseQuantity({ productId, size }));
  }

  // Decrease quantity
  decrease(productId: string, size: number): void {
    this.store.dispatch(decreaseQuantity({ productId, size }));
  }

  // Open remove confirmation
  remove(productId: string, size: number): void {
    this.selectedProductId = productId;
    this.selectedSize = size;
    this.showRemoveConfirmation = true;
  }

  // Confirm removing product
  confirmRemove(): void {
    if (this.selectedProductId === null || this.selectedSize === null) {
      return;
    }

    this.store.dispatch(
      removeFromCart({
        productId: this.selectedProductId,
        size: this.selectedSize
      })
    );

    this.closeRemoveConfirmation();
  }

  // Close remove confirmation
  closeRemoveConfirmation(): void {
    this.showRemoveConfirmation = false;
    this.selectedProductId = null;
    this.selectedSize = null;
  }

  // Open clear cart confirmation
  clear(): void {
    this.showClearConfirmation = true;
  }

  // Confirm clearing entire cart
  confirmClear(): void {
    this.store.dispatch(clearCart());
    this.showClearConfirmation = false;
  }

  // Close clear cart confirmation
  closeClearConfirmation(): void {
    this.showClearConfirmation = false;
  }
}
