import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model';

// LOAD PRODUCTS
export const loadProducts = createAction(
  '[Products] Load Products'
);

export const loadProductsSuccess = createAction(
  '[Products] Load Products Success',
  props<{ products: Product[] }>()
);

export const loadProductsFailure = createAction(
  '[Products] Load Products Failure',
  props<{ error: string }>()
);

// ADD PRODUCT
export const addProduct = createAction(
  '[Products] Add Product',
  props<{ product: Omit<Product, 'id'> }>()
);

export const addProductSuccess = createAction(
  '[Products] Add Product Success',
  props<{ product: Product }>()
);

export const addProductFailure = createAction(
  '[Products] Add Product Failure',
  props<{ error: string }>()
);

// UPDATE PRODUCT
export const updateProduct = createAction(
  '[Products] Update Product',
  props<{ product: Product }>()
);

export const updateProductSuccess = createAction(
  '[Products] Update Product Success',
  props<{ product: Product }>()
);

export const updateProductFailure = createAction(
  '[Products] Update Product Failure',
  props<{ error: string }>()
);

// DELETE PRODUCT
export const deleteProduct = createAction(
  '[Products] Delete Product',
  props<{ id: string }>()
);

export const deleteProductSuccess = createAction(
  '[Products] Delete Product Success',
  props<{ id: string }>()
);

export const deleteProductFailure = createAction(
  '[Products] Delete Product Failure',
  props<{ error: string }>()
);