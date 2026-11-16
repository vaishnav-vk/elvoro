import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';

import { ProductApiService } from '../../core/services/shopping/product-api';

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

@Injectable()
export class ProductsEffects {

  private actions$ = inject(Actions);
  private productApi = inject(ProductApiService);

  // LOAD PRODUCTS
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      switchMap(() =>
        this.productApi.getProducts().pipe(
          map(products => loadProductsSuccess({ products })),
          catchError(error =>
            of(loadProductsFailure({
              error: error?.message ?? 'Unable to load products'
            }))
          )
        )
      )
    )
  );

  // ADD PRODUCT
  addProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addProduct),
      switchMap(({ product }) =>
        this.productApi.addProduct(product).pipe(
          map(savedProduct =>
            addProductSuccess({ product: savedProduct })
          ),
          catchError(error =>
            of(addProductFailure({
              error: error?.message ?? 'Unable to add product'
            }))
          )
        )
      )
    )
  );

  // UPDATE PRODUCT
  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateProduct),
      switchMap(({ product }) =>
        this.productApi.updateProduct(product).pipe(
          map(updatedProduct =>
            updateProductSuccess({ product: updatedProduct })
          ),
          catchError(error =>
            of(updateProductFailure({
              error: error?.message ?? 'Unable to update product'
            }))
          )
        )
      )
    )
  );

  // DELETE PRODUCT
  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteProduct),
      switchMap(({ id }) =>
        this.productApi.deleteProduct(id).pipe(
          map(() => deleteProductSuccess({ id })),
          catchError(error =>
            of(deleteProductFailure({
              error: error?.message ?? 'Unable to delete product'
            }))
          )
        )
      )
    )
  );
}