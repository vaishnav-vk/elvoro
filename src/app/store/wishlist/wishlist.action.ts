import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model';
import { WishlistItem } from '../../core/models/wishlist.model';


export const loadWishlist = createAction(
  '[Wishlist] Load Wishlist',
  props<{ userEmail: string }>()
);

export const loadWishlistSuccess = createAction(
  '[Wishlist] Load Wishlist Success',
  props<{ items: WishlistItem[] }>()
);

export const loadWishlistFailure = createAction(
  '[Wishlist] Load Wishlist Failure',
  props<{ error: string }>()
);


export const addToWishlist = createAction(
  '[Wishlist] Add To Wishlist',
  props<{ product: Product; userEmail: string }>()
);

export const addToWishlistSuccess = createAction(
  '[Wishlist] Add To Wishlist Success',
  props<{ item: WishlistItem }>()
);

export const addToWishlistFailure = createAction(
  '[Wishlist] Add To Wishlist Failure',
  props<{ error: string }>()
);


export const removeFromWishlist = createAction(
  '[Wishlist] Remove From Wishlist',
  props<{ id: string }>()
);

export const removeFromWishlistSuccess = createAction(
  '[Wishlist] Remove From Wishlist Success',
  props<{ id: string }>()
);

export const removeFromWishlistFailure = createAction(
  '[Wishlist] Remove From Wishlist Failure',
  props<{ error: string }>()
);


export const clearWishlist = createAction(
  '[Wishlist] Clear Wishlist',
  props<{ userEmail: string }>()
);

export const clearWishlistSuccess = createAction(
  '[Wishlist] Clear Wishlist Success'
);

export const clearWishlistFailure = createAction(
  '[Wishlist] Clear Wishlist Failure',
  props<{ error: string }>()
);

export const clearWishlistState = createAction(
  '[Wishlist] Clear Wishlist State'
);