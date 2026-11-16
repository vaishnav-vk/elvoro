import { Component,inject } from '@angular/core';
import { AsyncPipe,CurrencyPipe } from '@angular/common';
import { RouterLink,ActivatedRoute,Router } from '@angular/router';
import { Store  } from '@ngrx/store';
import { catchError,map,switchMap,of,Observable ,take} from 'rxjs';
import { Product } from '../../core/models/product.model';
import { ProductApiService } from '../../core/services/shopping/product-api';
import { addToCart } from '../../store/cart/cart.action';
import { __param } from 'tslib';
import { selectCartItems } from '../../store/cart/cart.selectors';
import { NotificationServices } from '../../core/services/shared/notification';
import { BuyNowService } from '../../core/services/shopping/buy-now';
import { CartItem } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth/auth';
import { PendingCartService } from '../../core/services/shopping/pending-cart';
import { addToWishlist } from '../../store/wishlist/wishlist.action';
import { removeFromWishlist } from '../../store/wishlist/wishlist.action';
import { selectWishlistItems } from '../../store/wishlist/wishlist.selectors';
import { WishlistItem } from '../../core/models/wishlist.model';


@Component({
  imports: [AsyncPipe,CurrencyPipe,RouterLink],
  selector: 'app-productdetails',
  styleUrl: './productdetails.css',
  templateUrl: './productdetails.html',
})
export class Productdetails {
  private route = inject(ActivatedRoute);
  private productApi = inject(ProductApiService);
  private store = inject(Store);
  private notificationService = inject(NotificationServices);
  private router = inject(Router);
  private buyNowService = inject(BuyNowService);
  private authService = inject(AuthService);
  private pendingCart = inject(PendingCartService);

  cartItems$ = this.store.select(selectCartItems);
  wishlistItems$ = this.store.select(selectWishlistItems);

  selectedSize = 8;
  message = '';

  product$: Observable<Product | null> = this.route.paramMap.pipe(

    map(params => params.get('id')),

    switchMap(id => {

      if (!id) {
        return of(null);
      }

      return this.productApi.getProductById(id).pipe(
        catchError(() => of(null))
      );

    })

  );

  selectSize(size: number): void {

    this.selectedSize = size;
    this.message = '';

  }

  addProductToCart(product: Product): void {

    if (!this.authService.currentUser) {

      this.pendingCart.save(product, this.selectedSize);

      this.notificationService.show(
        'Please login to add products to your cart.',
        'error',
        'Login Required!'
      );

      this.router.navigate(['/login']);

      return;
    }

    this.cartItems$.pipe(take(1)).subscribe(cartItems => {

      const alreadyAdded = cartItems.some(item =>
        item.product.id === product.id &&
        item.size === this.selectedSize
      );

      if (alreadyAdded) {

        this.notificationService.show(
          'This product is already in your cart.',
          'error',
          'Already Added!'
        );

      } else {

        this.store.dispatch(
          addToCart({
            product,
            size: this.selectedSize
          })
        );

        this.notificationService.show(
          `${product.name} has been added to your cart.`,
          'success',
          'Added to Cart!'
        );

      }

    });

  }

  buyNow(product: Product): void {

    if (!this.selectedSize) {

      this.notificationService.show(
        'Please select a shoe size first.',
        'error',
        'Select Size!'
      );

      return;
    }

    const item: CartItem = {
      product: product,
      size: this.selectedSize,
      quantity: 1
    };

    this.buyNowService.setBuyNowItem(item);

    this.router.navigate(['/checkout'], {
      queryParams: { mode: 'buy-now' }
    });

  }


  toggleWishlist(product: Product): void {

  const user = this.authService.currentUser;

  if (!user?.email) {
    this.router.navigate(['/login']);
    return;
  }

  this.wishlistItems$.pipe(take(1)).subscribe(items => {

    const existingItem = items.find(
      item => item.productId === product.id
    );

    if (existingItem?.id) {

     
      this.store.dispatch(
        removeFromWishlist({
          id: existingItem.id
          
        })
      );

      this.notificationService.show(
        'Product removed from wishlist.',
        'success'
      );

    } else {

      this.store.dispatch(
        addToWishlist({
          product,
          userEmail: user.email
        })
      );

      this.notificationService.show(
        `${product.name} added to wishlist.`,
        'success'
      );

    }

  });
}

}
