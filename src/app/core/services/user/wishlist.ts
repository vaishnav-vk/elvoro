import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, of } from 'rxjs';

import { Product } from '../../models/product.model';
export interface WishlistItem {
  id?: string;
  userEmail: string;
  productId: string;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/wishlist';

  // Get wishlist for a particular user
  getWishlist(userEmail: string): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(
      `${this.apiUrl}?userEmail=${encodeURIComponent(userEmail)}`
    );
  }

  // Add product to wishlist
  addToWishlist(
    product: Product,
    userEmail: string
  ): Observable<WishlistItem> {

    return this.getWishlist(userEmail).pipe(
      switchMap(items => {

        const alreadyExists = items.some(
          item => item.productId === product.id
        );

        if (alreadyExists) {
          throw new Error('Product already exists in wishlist.');
        }

        const wishlistItem: WishlistItem = {
          userEmail,
          productId: product.id,
          product
        };

        return this.http.post<WishlistItem>(
          this.apiUrl,
          wishlistItem
        );
      })
    );
  }

  // Remove one wishlist item
  removeFromWishlist(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Clear all wishlist items for a user
  clearWishlist(userEmail: string): Observable<void[]> {

    return this.getWishlist(userEmail).pipe(
      switchMap(items => {

        if (items.length === 0) {
          return of([]);
        }

        const deleteRequests = items
          .filter(item => item.id !== undefined)
          .map(item =>
            this.http.delete<void>(`${this.apiUrl}/${item.id}`)
          );

        if (deleteRequests.length === 0) {
          return of([]);
        }

        return forkJoin(deleteRequests);
      })
    );
  }
}