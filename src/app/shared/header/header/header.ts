
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth/auth';
import { selectCartCount } from '../../../store/cart/cart.selectors';
import {
  NotificationServices,
  Notification
} from '../../../core/services/shared/notification';

import { Observable, Subject, takeUntil } from 'rxjs';

import { selectWishlistCount } from '../../../store/wishlist/wishlist.selectors';
import {
  loadWishlist,
  clearWishlistState
} from '../../../store/wishlist/wishlist.action';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit, OnDestroy {

  private store = inject(Store);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationServices);

  private destroy$ = new Subject<void>();

  // Cart count
  cartCount$ = this.store.select(selectCartCount);

  // Wishlist count
  wishlistCount$ = this.store.select(selectWishlistCount);

  // Current logged-in user
  currentUser$ = this.authService.currentUser$;

  // Notifications
  notification$: Observable<Notification | null> =
    this.notificationService.notification$;

  ngOnInit(): void {

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {

        if (user?.email) {

          // Load wishlist for the logged-in user
          this.store.dispatch(
            loadWishlist({
              userEmail: user.email
            })
          );

        } else {

          // Clear wishlist when user logs out
          this.store.dispatch(clearWishlistState());

        }

      });

  }

  logOut(): void {

    this.authService.logOut();

    this.notificationService.show(
      'You have successfully logged out. See you again!',
      'success',
      'Logout Successful!'
    );

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
