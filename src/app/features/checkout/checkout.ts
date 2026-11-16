
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterLink, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { CartItem } from '../../core/models/product.model';
import { Order } from '../../core/models/order.model';

import {
  selectCartItems,
  selectCartTotal
} from '../../store/cart/cart.selectors';

import { clearCart } from '../../store/cart/cart.action';

import {
  applyCoupon,
  removeCoupon,
  couponValidationFailed
} from '../../store/discount/discount.action';

import {
  selectCouponCode,
  selectCouponError,
  selectDiscountAmount,
  selectDiscountPercentage
} from '../../store/discount/discount.selectors';

import { BuyNowService } from '../../core/services/shopping/buy-now';
import { OrderService } from '../../core/services/shared/order';
import { AuthService } from '../../core/services/auth/auth';

import {
  AddressService,
  SavedAddress
} from '../../core/services/user/address';

import { DiscountService } from '../../core/services/shopping/discount';

import { FormsModule } from '@angular/forms';

import {
  of,
  map,
  take,
  combineLatest
} from 'rxjs';


@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule
  ],
  styleUrl: './checkout.css',
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {

  // Services
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private buyNowService = inject(BuyNowService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private addressService = inject(AddressService);
  private discountService = inject(DiscountService);
  private cdr = inject(ChangeDetectorRef);

  // Error messages
  orderError = '';

  // Cart
  items$ = this.store.select(selectCartItems);
  total$ = this.store.select(selectCartTotal);

  // Coupon observables
  couponCode$ = this.store.select(selectCouponCode);
  couponError$ = this.store.select(selectCouponError);

  discountPercentage$ = this.store.select(
    selectDiscountPercentage
  );

  discountAmount$ = this.store.select(
    selectDiscountAmount
  );

  // Order
  orderPlaced = false;
  orderNumber = '';
  couponInput = '';
  isPlacingOrder = false;

  // Coupon loading
  isApplyingCoupon = false;

  // Payment
  paymentMethod: 'COD' = 'COD';

  // Address management
  hasSavedAddress = false;
  useSavedAddress = false;
  saveNewAddress = false;
  editingSavedAddress = false;
  addressLoading = false;

  savedAddress: SavedAddress | null = null;

  addressMessage = '';
  addressError = '';

  // Get logged-in user's ID
  private get userId(): string | number | null {
    return this.authService.currentUser?.id ?? null;
  }

  // Checkout form
  checkoutForm = new FormGroup({

    fullName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern(/^[a-zA-Z ]+$/)
    ]),

    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    phone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[6-9]\d{9}$/)
    ]),

    address: new FormControl('', Validators.required),

    city: new FormControl('', Validators.required),

    state: new FormControl('', Validators.required),

    pinCode: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{6}$/)
    ])

  });

  // Buy Now
  isBuyNow =
    this.route.snapshot.queryParamMap.get('mode') === 'buy-now';

  buyNowItem = this.buyNowService.getBuyNowItem();

  // Checkout items
  checkoutItems$ =
    this.isBuyNow && this.buyNowItem
      ? of([this.buyNowItem])
      : this.items$;

  // Checkout subtotal
  checkoutTotal$ = this.checkoutItems$.pipe(

    map(items =>
      items.reduce(
        (total, item) =>
          total + item.product.price * item.quantity,
        0
      )
    )

  );

  // Calculate discount for current checkout items
  checkoutDiscountAmount$ = combineLatest([

    this.checkoutTotal$,
    this.discountAmount$

  ]).pipe(

    map(([subtotal, discount]) =>
      Math.min(subtotal, discount)
    )

  );

  // Calculate final checkout amount
  checkoutFinalTotal$ = combineLatest([

    this.checkoutTotal$,
    this.checkoutDiscountAmount$

  ]).pipe(

    map(([subtotal, discount]) =>
      Math.max(0, subtotal - discount)
    )

  );


  // Component initialization
  ngOnInit(): void {
    this.loadSavedAddress();
  }


  // Load saved address from JSON Server
  loadSavedAddress(): void {

    const userId = this.userId;

    if (userId === null) {

      this.hasSavedAddress = false;
      this.useSavedAddress = false;
      this.savedAddress = null;

      return;
    }

    this.addressLoading = true;
    this.addressError = '';

    this.addressService.getAddress(userId)
      .pipe(take(1))
      .subscribe({

        next: (addresses) => {

          this.addressLoading = false;

          this.savedAddress =
            addresses.length > 0 ? addresses[0] : null;

          this.hasSavedAddress = !!this.savedAddress;

          if (this.savedAddress) {
            this.selectSavedAddress();
          } else {
            this.useSavedAddress = false;
          }

        },

        error: () => {

          this.addressLoading = false;

          this.addressError =
            'Unable to load saved address.';

        }

      });

  }


  // Use saved address
  selectSavedAddress(): void {

    if (!this.savedAddress) {
      this.loadSavedAddress();
      return;
    }

    this.checkoutForm.patchValue({

      fullName: this.savedAddress.fullName,
      email: this.savedAddress.email,
      phone: this.savedAddress.phone,
      address: this.savedAddress.address,
      city: this.savedAddress.city,
      state: this.savedAddress.state,
      pinCode: this.savedAddress.pinCode

    });

    this.useSavedAddress = true;
    this.saveNewAddress = false;
    this.editingSavedAddress = false;

    this.addressMessage = '';
    this.addressError = '';

  }


  // Add a new address
  selectNewAddress(): void {

    this.useSavedAddress = false;
    this.saveNewAddress = true;
    this.editingSavedAddress = false;

    this.addressMessage = '';
    this.addressError = '';

    this.checkoutForm.reset({

      fullName: '',
      email: this.authService.currentUser?.email ?? '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pinCode: ''

    });

  }


  // Edit saved address
  editSavedAddress(): void {

    if (!this.savedAddress) return;

    this.checkoutForm.patchValue({

      fullName: this.savedAddress.fullName,
      email: this.savedAddress.email,
      phone: this.savedAddress.phone,
      address: this.savedAddress.address,
      city: this.savedAddress.city,
      state: this.savedAddress.state,
      pinCode: this.savedAddress.pinCode

    });

    this.useSavedAddress = false;
    this.saveNewAddress = true;
    this.editingSavedAddress = true;

    this.addressMessage = '';
    this.addressError = '';

  }


  // Create address data from form
  private getAddressData(): Omit<SavedAddress, 'id'> | null {

    const userId = this.userId;

    if (userId === null) return null;

    const form = this.checkoutForm.getRawValue();

    return {

      userId,
      fullName: form.fullName ?? '',
      email: form.email ?? '',
      phone: form.phone ?? '',
      address: form.address ?? '',
      city: form.city ?? '',
      state: form.state ?? '',
      pinCode: form.pinCode ?? ''

    };

  }


  // Save or update address
  saveAddressDetails(): void {

    if (this.checkoutForm.invalid) {

      this.checkoutForm.markAllAsTouched();

      this.addressError =
        'Please complete all required address details.';

      this.addressMessage = '';

      return;
    }

    const addressData = this.getAddressData();

    if (!addressData) {

      this.addressError =
        'Please log in to save your address.';

      return;
    }

    const request = this.savedAddress?.id !== undefined

      ? this.addressService.updateAddress(
          this.savedAddress.id,
          addressData
        )

      : this.addressService.saveAddress(addressData);

    this.addressLoading = true;

    request.pipe(take(1)).subscribe({

      next: (savedAddress) => {

        this.addressLoading = false;

        this.savedAddress = savedAddress;
        this.hasSavedAddress = true;
        this.useSavedAddress = true;
        this.saveNewAddress = false;
        this.editingSavedAddress = false;

        this.addressError = '';

        this.addressMessage =
          'Address saved successfully!';

      },

      error: () => {

        this.addressLoading = false;

        this.addressError =
          'Unable to save address. Please try again.';

        this.addressMessage = '';

      }

    });

  }


  // Delete saved address
  deleteSavedAddress(): void {

    if (this.savedAddress?.id === undefined) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete your saved address?'
    );

    if (!confirmed) return;

    this.addressLoading = true;

    this.addressService.deleteAddress(this.savedAddress.id)
      .pipe(take(1))
      .subscribe({

        next: () => {

          this.addressLoading = false;

          this.savedAddress = null;
          this.hasSavedAddress = false;
          this.useSavedAddress = false;
          this.saveNewAddress = false;
          this.editingSavedAddress = false;

          this.addressMessage =
            'Saved address deleted successfully!';

          this.addressError = '';

          this.checkoutForm.reset({

            fullName: '',
            email: this.authService.currentUser?.email ?? '',
            phone: '',
            address: '',
            city: '',
            state: '',
            pinCode: ''

          });

        },

        error: () => {

          this.addressLoading = false;

          this.addressError =
            'Unable to delete saved address.';

        }

      });

  }


  // Save address after successful order if requested
  saveAddress(): void {

    if (!this.saveNewAddress || this.useSavedAddress) {
      return;
    }

    if (this.checkoutForm.invalid) return;

    const addressData = this.getAddressData();

    if (!addressData) return;

    const request = this.savedAddress?.id !== undefined

      ? this.addressService.updateAddress(
          this.savedAddress.id,
          addressData
        )

      : this.addressService.saveAddress(addressData);

    request.pipe(take(1)).subscribe({

      next: (savedAddress) => {

        this.savedAddress = savedAddress;
        this.hasSavedAddress = true;
        this.useSavedAddress = true;
        this.saveNewAddress = false;
        this.editingSavedAddress = false;

      },

      error: () => {

        this.addressError =
          'Order placed, but address could not be saved.';

      }

    });

  }


  // Apply coupon from Admin-created discounts
  applyDiscount(): void {

    const code = this.couponInput.trim().toUpperCase();

    if (!code || this.isApplyingCoupon) {
      return;
    }

    this.isApplyingCoupon = true;

    this.checkoutItems$.pipe(take(1)).subscribe(items => {

      const subtotal = items.reduce(

        (total, item) =>
          total + item.product.price * item.quantity,

        0

      );

      if (subtotal <= 0) {

        this.store.dispatch(
          couponValidationFailed({
            error: 'Your order total must be greater than zero.'
          })
        );

        this.isApplyingCoupon = false;
        return;

      }

      this.discountService.getDiscounts()
        .pipe(take(1))
        .subscribe({

          next: (discounts) => {

            // Find coupon in JSON Server
            const coupon = discounts.find(

              d => d.code.trim().toUpperCase() === code

            );

            // Check coupon existence
            if (!coupon) {

              this.store.dispatch(
                couponValidationFailed({
                  error: 'Invalid coupon code. Please try again.'
                })
              );

              this.isApplyingCoupon = false;
              return;

            }

            // Check coupon status
            if (coupon.status !== 'active') {

              this.store.dispatch(
                couponValidationFailed({
                  error: 'This coupon is inactive.'
                })
              );

              this.isApplyingCoupon = false;
              return;

            }

            // Check expiry date
            const today = new Date();

            const expiryDate = new Date(
              coupon.expiryDate + 'T23:59:59'
            );

            if (
              Number.isNaN(expiryDate.getTime()) ||
              today > expiryDate
            ) {

              this.store.dispatch(
                couponValidationFailed({
                  error: 'This coupon has expired.'
                })
              );

              this.isApplyingCoupon = false;
              return;

            }

            // Check usage limit
            if (coupon.usageCount >= coupon.usageLimit) {

              this.store.dispatch(
                couponValidationFailed({
                  error: 'Coupon usage limit reached.'
                })
              );

              this.isApplyingCoupon = false;
              return;

            }

            // Check minimum order amount
            if (subtotal < coupon.minOrder) {

              this.store.dispatch(
                couponValidationFailed({
                  error: `Minimum order amount is ₹${coupon.minOrder}.`
                })
              );

              this.isApplyingCoupon = false;
              return;

            }

            // Calculate discount
            let discountAmount = 0;

            if (coupon.type === 'percentage') {

              discountAmount =
                subtotal * coupon.value / 100;

              // Apply maximum discount limit
              if (coupon.maxDiscount > 0) {

                discountAmount = Math.min(
                  discountAmount,
                  coupon.maxDiscount
                );

              }

            } else {

              // Fixed discount
              discountAmount = Math.min(
                coupon.value,
                subtotal
              );

            }

            // Calculate effective discount percentage
            const discountPercentage = subtotal > 0

              ? (discountAmount / subtotal) * 100

              : 0;

            // Dispatch validated coupon to NgRx
            this.store.dispatch(

              applyCoupon({

                code: coupon.code,
                discountAmount,
                discountPercentage

              })

            );

            this.couponInput = '';
            this.isApplyingCoupon = false;

          },

          error: (error) => {

            console.error(
              'Coupon validation failed:',
              error
            );

            this.store.dispatch(
              couponValidationFailed({
                error: 'Unable to validate coupon. Please try again.'
              })
            );

            this.isApplyingCoupon = false;

          }

        });

    });

  }


  // Place order
  placeOrder(items: CartItem[]): void {

    // Prevent duplicate order submissions
    if (this.isPlacingOrder || this.orderPlaced) {
      return;
    }

    if (this.checkoutForm.invalid || items.length === 0) {

      this.checkoutForm.markAllAsTouched();
      return;

    }

    this.orderError = '';
    this.isPlacingOrder = true;

    // Use actual calculated discount amount
    this.discountAmount$.pipe(take(1)).subscribe(discountAmount => {

      const subtotal = items.reduce(

        (total, item) =>
          total + item.product.price * item.quantity,

        0

      );

      const discount = Math.min(
        subtotal,
        discountAmount
      );

      const percentage = subtotal > 0

        ? (discount / subtotal) * 100

        : 0;

      const finalTotal = Math.max(
        0,
        subtotal - discount
      );

      const form = this.checkoutForm.getRawValue();

      const order: Omit<Order, 'id'> = {

        orderNumber:
          'ELV-' + Date.now().toString().slice(-8),

        userEmail:
          this.authService.currentUser?.email ?? form.email ?? '',

        customerName: form.fullName ?? '',
        customerEmail: form.email ?? '',
        phone: form.phone ?? '',

        address: form.address ?? '',
        city: form.city ?? '',
        state: form.state ?? '',
        pinCode: form.pinCode ?? '',

        items: items.map(item => ({

          ...item,
          product: { ...item.product }

        })),

        subtotal,
        discount,
        discountPercentage: percentage,
        finalTotal,

        paymentMethod: this.paymentMethod,
        status: 'Pending',
        orderDate: new Date().toISOString()

      };

      this.orderService.createOrder(order)
        .pipe(take(1))
        .subscribe({

          next: savedOrder => {

            this.orderNumber = savedOrder.orderNumber;
            this.orderPlaced = true;

            // Save address
            this.saveAddress();

            // Clear Buy Now or Cart
            if (this.isBuyNow) {

              this.buyNowService.clearBuyNowItem();

            } else {

              this.store.dispatch(clearCart());

            }

            // Remove applied coupon
            this.removeDiscount();

            this.cdr.detectChanges();

          },

          error: error => {

            console.error(
              'Order creation failed:',
              error
            );

            this.orderError =
              'Order could not be placed. Please try again.';

            this.isPlacingOrder = false;

            this.cdr.detectChanges();

          }

        });

    });

  }


  // Remove coupon
  removeDiscount(): void {

    this.store.dispatch(removeCoupon());

  }

}
