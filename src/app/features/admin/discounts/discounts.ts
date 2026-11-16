
import { Component, OnInit, inject,ChangeDetectorRef } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DiscountService } from '../../../core/services/shopping/discount';

import { Discount } from '../../../core/models/discount.model';

@Component({
  selector: 'app-discount',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './discounts.html',
  styleUrl: './discounts.css'
})
export class DiscountComponent implements OnInit {

  private fb = inject(FormBuilder);
  private service = inject(DiscountService);
  private cdr=inject(ChangeDetectorRef)

  discounts: Discount[] = [];

  isEditing = false;
  editingId: string | number | null = null;

  isLoading = false;
  isSaving = false;

  searchTerm = '';

  message = '';
  messageType: 'success' | 'error' = 'success';

  // REACTIVE FORM

  discountForm = this.fb.nonNullable.group({

    code: ['', Validators.required],

    type: ['percentage' as 'percentage' | 'fixed'],

    value: [0, [
      Validators.required,
      Validators.min(1)
    ]],

    minOrder: [0, [
      Validators.required,
      Validators.min(0)
    ]],

    maxDiscount: [0, [
      Validators.required,
      Validators.min(0)
    ]],

    expiryDate: ['', Validators.required],

    usageLimit: [100, [
      Validators.required,
      Validators.min(1)
    ]],

    status: ['active' as 'active' | 'inactive']

  });

  // INITIALIZE

  ngOnInit(): void {
    this.loadDiscounts();
  }

  // READ COUPONS

  loadDiscounts(): void {

    this.isLoading = true;

    this.service.getDiscounts().subscribe({

      next: (data) => {

        this.discounts = data;

        this.isLoading = false;

        this.cdr.detectChanges();


      },

      error: (error) => {

        console.error('Load error:', error);

        this.showMessage(
          'Failed to load coupons',
          'error'
        );

        this.isLoading = false;

      }

    });

  }

  // GENERATE DYNAMIC COUPON CODE

  generateCouponCode(): void {

    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let code = '';
    let attempts = 0;

    do {

      const randomPart = Array.from(
        { length: 6 },
        () => characters[
          Math.floor(Math.random() * characters.length)
        ]
      ).join('');

      code = `ELVORO${randomPart}`;

      attempts++;

    } while (

      this.discounts.some(
        d => d.code.toUpperCase() === code
      ) && attempts < 100

    );

    if (
      this.discounts.some(
        d => d.code.toUpperCase() === code
      )
    ) {

      this.showMessage(
        'Unable to generate a unique coupon. Try again.',
        'error'
      );

      return;

    }

    this.discountForm.patchValue({
      code: code
    });

    this.showMessage(
      'Coupon code generated successfully',
      'success'
    );

  }

  // CREATE / UPDATE COUPON

  saveDiscount(): void {

    if (this.isSaving) return;

    if (this.discountForm.invalid) {

      this.discountForm.markAllAsTouched();

      return;

    }

    const form = this.discountForm.getRawValue();

    if (!form.code) {

      this.showMessage(
        'Please generate a coupon code first',
        'error'
      );

      return;

    }

    const code = form.code.trim().toUpperCase();

    // CHECK DUPLICATE COUPON

    const duplicate = this.discounts.some(d =>

      d.code.toUpperCase() === code &&
      d.id !== this.editingId

    );

    if (duplicate) {

      this.showMessage(
        'Coupon code already exists',
        'error'
      );

      return;

    }

    // PERCENTAGE VALIDATION

    if (
      form.type === 'percentage' &&
      form.value > 100
    ) {

      this.showMessage(
        'Percentage cannot exceed 100',
        'error'
      );

      return;

    }

    // EXPIRY DATE VALIDATION

    const today = this.getLocalDate();

    if (form.expiryDate < today) {

      this.showMessage(
        'Expiry date cannot be in the past',
        'error'
      );

      return;

    }

    // PRESERVE USAGE COUNT WHEN EDITING

    const existing = this.discounts.find(
      d => d.id === this.editingId
    );

    const data: Discount = {

      ...form,

      code,

      usageCount: existing?.usageCount ?? 0

    };

    this.isSaving = true;

    // UPDATE EXISTING COUPON

    if (
      this.isEditing &&
      this.editingId !== null
    ) {

      this.service.updateDiscount(
        this.editingId,
        data
      ).subscribe({

        next: () => {

          this.showMessage(
            'Coupon updated successfully',
            'success'
          );

          this.resetForm();

          this.isSaving = false;

          this.loadDiscounts();

        },

        error: (error) => {

          console.error('Update error:', error);

          this.showMessage(
            'Failed to update coupon',
            'error'
          );

          this.isSaving = false;

        }

      });

    }

    // CREATE NEW COUPON

    else {

      this.service.addDiscount(data).subscribe({

        next: (savedCoupon) => {

          this.showMessage(
            `Coupon ${savedCoupon.code} created successfully`,
            'success'
          );

          this.resetForm();

          this.isSaving = false;

          this.loadDiscounts();

        },

        error: (error) => {

          console.error('Create error:', error);

          this.showMessage(
            'Failed to create coupon',
            'error'
          );

          this.isSaving = false;

        }

      });

    }

  }

  // EDIT COUPON

  editDiscount(discount: Discount): void {

    if (discount.id === undefined) return;

    this.isEditing = true;

    this.editingId = discount.id;

    this.discountForm.patchValue({

      code: discount.code,

      type: discount.type,

      value: discount.value,

      minOrder: discount.minOrder,

      maxDiscount: discount.maxDiscount,

      expiryDate: discount.expiryDate,

      usageLimit: discount.usageLimit,

      status: discount.status

    });

    this.message = '';

  }

  // DELETE COUPON

  deleteDiscount(id: string | number): void {

    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    this.service.deleteDiscount(id).subscribe({

      next: () => {

        this.showMessage(
          'Coupon deleted successfully',
          'success'
        );

        if (this.editingId === id) {
          this.resetForm();
        }

        this.loadDiscounts();

      },

      error: (error) => {

        console.error('Delete error:', error);

        this.showMessage(
          'Failed to delete coupon',
          'error'
        );

      }

    });

  }

  // SEARCH COUPONS

  get filteredDiscounts(): Discount[] {

    const search = this.searchTerm
      .trim()
      .toLowerCase();

    return this.discounts.filter(d =>
      d.code.toLowerCase().includes(search)
    );

  }

  onSearch(event: Event): void {

    this.searchTerm =
      (event.target as HTMLInputElement).value;

  }

  // STATISTICS

  get totalCoupons(): number {
    return this.discounts.length;
  }

  get activeCoupons(): number {

    return this.discounts.filter(
      d => this.getCouponStatus(d) === 'active'
    ).length;

  }

  get expiredCoupons(): number {

    return this.discounts.filter(
      d => this.getCouponStatus(d) === 'expired'
    ).length;

  }

  // COUPON STATUS

  getCouponStatus(
    discount: Discount
  ): 'active' | 'inactive' | 'expired' {

    if (discount.status === 'inactive') {
      return 'inactive';
    }

    if (discount.expiryDate < this.getLocalDate()) {
      return 'expired';
    }

    if (discount.usageCount >= discount.usageLimit) {
      return 'expired';
    }

    return 'active';

  }

  // LOCAL DATE

  private getLocalDate(): string {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  // MESSAGE

  private showMessage(
    message: string,
    type: 'success' | 'error'
  ): void {

    this.message = message;

    this.messageType = type;

  }

  // RESET FORM

  resetForm(): void {

    this.isEditing = false;

    this.editingId = null;

    this.discountForm.reset({

      code: '',

      type: 'percentage',

      value: 0,

      minOrder: 0,

      maxDiscount: 0,

      expiryDate: '',

      usageLimit: 100,

      status: 'active'

    });

    this.message = '';

  }

}
