import { createReducer, on } from '@ngrx/store';

import * as WishlistActions from './wishlist.action';
import { WishlistItem } from '../../core/models/wishlist.model';

export interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

export const initialWishlistState: WishlistState = {
  items: [],
  loading: false,
  error: null
};

export const wishlistReducer = createReducer(

  initialWishlistState,

  // Load
  on(WishlistActions.loadWishlist, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(WishlistActions.loadWishlistSuccess, (state, { items }) => ({
    ...state,
    items,
    loading: false
  })),

  on(WishlistActions.loadWishlistFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Add
  on(WishlistActions.addToWishlist, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(WishlistActions.addToWishlistSuccess, (state, { item }) => {

    const exists = state.items.some(
      existing => existing.productId === item.productId
    );

    return {
      ...state,
      items: exists ? state.items : [...state.items, item],
      loading: false
    };

  }),

  on(WishlistActions.addToWishlistFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Remove
  on(WishlistActions.removeFromWishlistSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter(item => item.id !== id),
    loading: false
  })),

  on(WishlistActions.removeFromWishlistFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Clear
  on(WishlistActions.clearWishlist, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(WishlistActions.clearWishlistSuccess, state => ({
    ...state,
    items: [],
    loading: false
  })),

  on(WishlistActions.clearWishlistFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(WishlistActions.clearWishlistState, () => ({
  items: [],
  loading: false,
  error: null
})),

);