import { createReducer, on } from '@ngrx/store';

import {
  applyCoupon,
  removeCoupon,
  couponValidationFailed
} from './discount.action';

export interface DiscountState {
  couponCode: string | null;
  discountPercentage: number;
  discountAmount: number;
  error: string | null;
}

export const initialDiscountState: DiscountState = {
  couponCode: null,
  discountPercentage: 0,
  discountAmount: 0,
  error: null
};

export const discountReducer = createReducer(
  initialDiscountState,

  on(applyCoupon, (state, { code, discountAmount, discountPercentage }) => ({
    couponCode: code,
    discountAmount,
    discountPercentage,
    error: null
  })),

  on(couponValidationFailed, (state, { error }) => ({
    ...initialDiscountState,
    error
  })),

  on(removeCoupon, () => initialDiscountState)
);