
import { createReducer, on } from '@ngrx/store';
import { CartItem } from '../../core/models/product.model';
import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  restoreCart
} from './cart.action';

export interface CartState {
  items: CartItem[];
}

export const initialCartState: CartState = {
  items: []
};

export const cartReducer = createReducer(
  initialCartState,

  on(addToCart, (state, { product, size }) => {
    const existing = state.items.find(
      item => item.product.id === product.id && item.size === size
    );

    if (existing) {
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }

    return {
      ...state,
      items: [...state.items, { product, size, quantity: 1 }]
    };
  }),

  on(increaseQuantity, (state, { productId, size }) => ({
    ...state,
    items: state.items.map(item =>
      item.product.id === productId && item.size === size
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  })),

  on(decreaseQuantity, (state, { productId, size }) => ({
    ...state,
    items: state.items
      .map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter(item => item.quantity > 0)
  })),

  on(removeFromCart, (state, { productId, size }) => ({
    ...state,
    items: state.items.filter(
      item => !(item.product.id === productId && item.size === size)
    )
  })),

  on(clearCart, () => initialCartState),
  

  on(restoreCart, (state, { items }) => ({
  ...state,
  items
}))
);


