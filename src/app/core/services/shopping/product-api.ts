import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/products';

  // GET: All products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // GET: Single product
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // POST: Add product
  addProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // PUT: Update product
  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(
      `${this.apiUrl}/${product.id}`,
      product
    );
  }

  // DELETE: Delete product
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}