import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../core/services/auth/auth';
import { NotificationServices } from '../../core/services/shared/notification';

import {
  loadWishlist,
  removeFromWishlist
} from '../../store/wishlist/wishlist.action';

import {
  selectWishlistItems,
  selectWishlistLoading
} from '../../store/wishlist/wishlist.selectors';

import { addToCart } from '../../store/cart/cart.action';

import { WishlistItem } from '../../core/models/wishlist.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist implements OnInit {

  private store = inject(Store);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationServices);

  items$ = this.store.select(selectWishlistItems);
  loading$ = this.store.select(selectWishlistLoading);

  ngOnInit(): void {

    const user = this.authService.currentUser;

    if (user?.email) {
      this.store.dispatch(
        loadWishlist({ userEmail: user.email })
      );
    }

  }

  remove(item: WishlistItem): void {

    if (!item.id) return;

    this.store.dispatch(
      removeFromWishlist({ id: item.id })
    );

    this.notificationService.show(
      `${item.product.name} removed from wishlist.`,
      'success'
    );

  }

  moveToCart(item: WishlistItem): void {

    
    const size = item.product.sizes?.[0];

    if (!size) {
      this.notificationService.show(
        'No available size for this product.',
        'error'
      );
      return;
    }

    this.store.dispatch(
      addToCart({
        product: item.product,
        size
      })
    );

    this.notificationService.show(
      `${item.product.name} added to your cart.`,
      'success'
    );

  }

}