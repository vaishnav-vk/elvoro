
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/orders';

  // Create a new order (customer checkout)
  createOrder(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  // Get orders belonging to a particular customer
  getOrders(userEmail: string): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiUrl}?userEmail=${encodeURIComponent(userEmail)}`
    );
  }

  // Get all orders (Admin)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // Update order status (Admin)
  updateOrderStatus(
    id: string | number,
    status: Order['status']
  ): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/${id}`,
      { status }
    );
  }

  // Cancel an order (Customer)
  cancelOrder(id: string | number): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/${id}`,
      { status: 'Cancelled' }
    );
  }

  // Delete an order (Admin)
  deleteOrder(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
