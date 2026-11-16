import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import {
  catchError,
  map,
  mergeMap,
  of
} from 'rxjs';

import { WishlistService } from '../../core/services/user/wishlist';
import * as WishlistActions from './wishlist.action';

@Injectable()
export class WishlistEffects {

  private actions$ = inject(Actions);
  private wishlistService = inject(WishlistService);

  
  loadWishlist$ = createEffect(() =>
    this.actions$.pipe(

      ofType(WishlistActions.loadWishlist),

      mergeMap(({ userEmail }) =>
        this.wishlistService.getWishlist(userEmail).pipe(

          map(items =>
            WishlistActions.loadWishlistSuccess({ items })
          ),

          catchError(error =>
            of(WishlistActions.loadWishlistFailure({
              error: error.message || 'Unable to load wishlist'
            }))
          )

        )
      )

    )
  );

 
addToWishlist$ = createEffect(() =>
  this.actions$.pipe(

    ofType(WishlistActions.addToWishlist),

    mergeMap(({ product, userEmail }) =>
      this.wishlistService.addToWishlist(
        product,
        userEmail
      ).pipe(

        map(item =>
          WishlistActions.addToWishlistSuccess({ item })
        ),

        catchError(error =>
          of(WishlistActions.addToWishlistFailure({
            error: error.message || 'Unable to add product'
          }))
        )

      )
    )

  )
);

  
  removeFromWishlist$ = createEffect(() =>
    this.actions$.pipe(

      ofType(WishlistActions.removeFromWishlist),

      mergeMap(({ id }) =>
        this.wishlistService.removeFromWishlist(id).pipe(

          map(() =>
            WishlistActions.removeFromWishlistSuccess({ id })
          ),

          catchError(error =>
            of(WishlistActions.removeFromWishlistFailure({
              error: error.message || 'Unable to remove product'
            }))
          )

        )
      )

    )
  );

  // Clear wishlist
  clearWishlist$ = createEffect(() =>
    this.actions$.pipe(

      ofType(WishlistActions.clearWishlist),

      mergeMap(({ userEmail }) =>
        this.wishlistService.clearWishlist(userEmail).pipe(

          map(() =>
            WishlistActions.clearWishlistSuccess()
          ),

          catchError(error =>
            of(WishlistActions.clearWishlistFailure({
              error: error.message || 'Unable to clear wishlist'
            }))
          )

        )
      )

    )
  );

}