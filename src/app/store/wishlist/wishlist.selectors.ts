import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WishlistState } from './wishlist.reducer';

export const selectWishlistState =
  createFeatureSelector<WishlistState>('wishlist');

export const selectWishlistItems = createSelector(
  selectWishlistState,
  state => state.items
);

export const selectWishlistCount = createSelector(
  selectWishlistItems,
  items => items.length
);

export const selectWishlistLoading = createSelector(
  selectWishlistState,
  state => state.loading
);

export const selectWishlistError = createSelector(
  selectWishlistState,
  state => state.error
);

export const selectIsWishlisted = (productId: string) =>
  createSelector(
    selectWishlistItems,
    items => items.some(item => item.productId === productId)
  );