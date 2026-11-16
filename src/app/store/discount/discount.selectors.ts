import {
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import { DiscountState } from './discount.reducer';

export const selectDiscountState =
  createFeatureSelector<DiscountState>('discount');

export const selectCouponCode = createSelector(
  selectDiscountState,
  state => state.couponCode
);

export const selectDiscountPercentage = createSelector(
  selectDiscountState,
  state => state.discountPercentage
);

export const selectDiscountAmount = createSelector(
  selectDiscountState,
  state => state.discountAmount
);

export const selectCouponError = createSelector(
  selectDiscountState,
  state => state.error
);