import { Injectable, inject } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  map,
  tap,
  catchError,
  withLatestFrom
} from 'rxjs';

import { LocalstorageServices } from '../../core/services/shared/localstorage';
import { AuthService } from '../../core/services/auth/auth';
import { selectCartItems } from './cart.selectors';

import {
  addToCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  restoreCart,
  loadCart
} from './cart.action';

@Injectable()
export class CartEffects {

  private actions$ = inject(Actions);
  private store = inject(Store);
  private storage = inject(LocalstorageServices);
  private authService = inject(AuthService);

  // Get the current user's unique cart key
  private getCartKey(): string | null {
    const user = this.authService.currentUser;

    return user ? `elvoro-cart-${user.id}` : null;
  }

  // Load the current user's cart
  loadCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCart),

      map(() => {
        const key = this.getCartKey();

        if (!key) {
          return restoreCart({ items: [] });
        }

        const savedCart = this.storage.getData<any[]>(key);

        return restoreCart({
          items: savedCart ?? []
        });
      }),

      catchError(() =>
        of(restoreCart({ items: [] }))
      )
    )
  );

  // Save cart changes for the logged-in user
  saveCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart
      ),

      withLatestFrom(
        this.store.select(selectCartItems)
      ),

      tap(([action, items]) => {
        const key = this.getCartKey();

        if (key) {
          this.storage.saveData(key, items);
        }
      })
    ),
    { dispatch: false }
  );
}