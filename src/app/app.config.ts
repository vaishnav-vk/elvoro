import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideHttpClient } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { productsReducer } from './store/products/products.reducer';
import { ProductsEffects } from './store/products/products.effect';
import { cartReducer } from './store/cart/cart.reducer';
import { CartEffects } from './store/cart/cart.effects';
import { discountReducer } from './store/discount/discount.reducer';
import { provideState } from '@ngrx/store';
import { WishlistEffects } from './store/wishlist/wishlist.effect';
import { wishlistReducer } from './store/wishlist/wishlist.reducer';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';



export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore({
      products:productsReducer,
      cart:cartReducer,
      discount:discountReducer
    }),
    provideHttpClient(),
    provideEffects([ProductsEffects,CartEffects,WishlistEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideState('wishlist', wishlistReducer),
    provideCharts(withDefaultRegisterables())

  ],
};
