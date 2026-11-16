import { createReducer, on } from '@ngrx/store';
import { Product } from '../../core/models/product.model';

import {
  loadProducts,
  loadProductsSuccess,
  loadProductsFailure,
  addProduct,
  addProductSuccess,
  addProductFailure,
  updateProduct,
  updateProductSuccess,
  updateProductFailure,
  deleteProduct,
  deleteProductSuccess,
  deleteProductFailure
} from './products.action';

export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null
};

export const productsReducer = createReducer(
  initialState,

  // LOAD
  on(loadProducts, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false
  })),

  on(loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // ADD
  on(addProduct, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(addProductSuccess, (state, { product }) => ({
    ...state,
    products: [...state.products, product],
    loading: false
  })),

  on(addProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // UPDATE
  on(updateProduct, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(updateProductSuccess, (state, { product }) => ({
    ...state,
    products: state.products.map(item =>
      item.id === product.id ? product : item
    ),
    loading: false
  })),

  on(updateProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // DELETE
  on(deleteProduct, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(deleteProductSuccess, (state, { id }) => ({
    ...state,
    products: state.products.filter(item =>
      item.id !== id
    ),
    loading: false
  })),

  on(deleteProductFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);