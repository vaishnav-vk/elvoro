import { createAction, props } from '@ngrx/store';

export const applyCoupon = createAction(
  '[Discount] Apply Coupon',
  props<{
    code: string;
    discountAmount: number;
    discountPercentage: number;
  }>()
);

export const couponValidationFailed = createAction(
  '[Discount] Coupon Validation Failed',
  props<{ error: string }>()
);

export const removeCoupon = createAction(
  '[Discount] Remove Coupon'
);