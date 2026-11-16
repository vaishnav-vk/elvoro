import { createAction, props } from '@ngrx/store';
import { CartItem, Product } from '../../core/models/product.model';

export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{ product: Product; size: number }>()
);

export const increaseQuantity = createAction(
  '[Cart] Increase Quantity',
  props<{ productId: string; size: number }>()
);

export const decreaseQuantity = createAction(
  '[Cart] Decrease Quantity',
  props<{ productId: string; size: number }>()
);

export const removeFromCart = createAction(
  '[Cart] Remove Item',
  props<{ productId: string; size: number }>()
);

export const clearCart = createAction('[Cart] Clear Cart');

export const loadCart = createAction('[Cart] Load Cart');

export const restoreCart = createAction(
  '[Cart] Restore Cart',
  props<{ items: CartItem[] }>()
);