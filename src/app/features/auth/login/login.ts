
import { Component, inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth';

import { NotificationServices } from '../../../core/services/shared/notification';
import { PendingCartService } from '../../../core/services/shopping/pending-cart';
import { Store, ActionsSubject } from '@ngrx/store';
import { ofType } from '@ngrx/effects';
import { take } from 'rxjs';

import {
  addToCart,
  loadCart,
  restoreCart
} from '../../../store/cart/cart.action';

import { selectCartItems } from '../../../store/cart/cart.selectors';

@Component({
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);
  private store = inject(Store);
  private actionsSubject = inject(ActionsSubject);
  private cdr = inject(ChangeDetectorRef);

  private notificationService = inject(NotificationServices);
  private pendingCart = inject(PendingCartService);

  notification$ = this.notificationService.notification$;

  errorMessage = '';
  successMessage = '';
  loading = false;
  showPassword = false;

  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(
        /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      )
    ]),

    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ])
  });

  clearError(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  
onLogin(): void {

  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMessage = '';
  this.successMessage = '';

  const email = this.loginForm.value.email!.trim();
  const password = this.loginForm.value.password!;

  this.authService.login(email, password).subscribe({

    next: (user) => {

      this.errorMessage = '';

      // ADMIN LOGIN
      if (user.role === 'admin') {

        this.loading = false;

        this.successMessage = 'Welcome to Elvoro Admin!';

        this.cdr.markForCheck();

        this.notificationService.show(
          'Welcome to Elvoro Admin!',
          'success'
        );

        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 500);

        return;
      }

      // CUSTOMER LOGIN
      // Wait until the customer's cart is restored.

      this.actionsSubject.pipe(
        ofType(restoreCart),
        take(1)
      ).subscribe(() => {

        this.loading = false;

        const pendingItem = this.pendingCart.get();

        if (pendingItem) {

          this.store.select(selectCartItems).pipe(
            take(1)
          ).subscribe(cartItems => {

            const alreadyAdded = cartItems.some(item =>
              item.product.id === pendingItem.product.id &&
              item.size === pendingItem.size
            );

            if (!alreadyAdded) {

              this.store.dispatch(
                addToCart({
                  product: pendingItem.product,
                  size: pendingItem.size
                })
              );

              this.notificationService.show(
                `${pendingItem.product.name} has been added to your cart.`,
                'success'
              );

            } else {

              this.notificationService.show(
                'This product is already in your cart.',
                'error'
              );

            }

            this.pendingCart.clear();

            this.router.navigate(['/cart']);

          });

        } else {

          this.successMessage =
            `Welcome to Elvoro, ${user.name}! Happy shopping.`;

          this.notificationService.show(
            this.successMessage,
            'success'
          );

          this.router.navigate(['/']);

        }

        this.cdr.markForCheck();

      });

      // Load only the customer's cart
      this.store.dispatch(loadCart());

    },

    error: (error) => {

      this.loading = false;

      // Display the actual error from AuthService
      this.errorMessage =
        error.message || 'Invalid email or password. Please try again.';

      // Error notification
      this.notificationService.show(
        'Login failed! Please check your email and password.',
        'error'
      );

      // Notify Angular to check the component
      this.cdr.markForCheck();

    }

  });
}

}
