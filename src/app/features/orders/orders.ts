import { Component,inject,OnInit } from '@angular/core';
import { CommonModule,CurrencyPipe,DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth';
import { OrderService } from '../../core/services/shared/order';
import { Order } from '../../core/models/order.model';
import { ChangeDetectorRef } from '@angular/core';
import { NotificationServices } from '../../core/services/shared/notification';

@Component({
  imports: [CommonModule,RouterLink,CurrencyPipe,DatePipe],
  selector: 'app-orders',
  styleUrl: './orders.css',
  templateUrl: './orders.html',
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private notificationService = inject(NotificationServices);

  orders: Order[] = [];

  loading = true;
  errorMessage = '';

  // CANCEL CONFIRMATION
  showCancelConfirmation = false;
  selectedOrderId: string | number | null = null;
  cancelling = false;

  ngOnInit(): void {
    this.loadOrders();
  }

  // LOAD ORDERS
  loadOrders(): void {

    const user = this.authService.currentUser;

    if (!user?.email) {
      this.loading = false;
      this.errorMessage = 'Please log in to view your orders.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.orderService.getOrders(user.email).subscribe({

      next: (data) => {

        console.log('Orders received:', data);

        this.orders = data.sort(
          (a, b) =>
            new Date(b.orderDate).getTime() -
            new Date(a.orderDate).getTime()
        );

        this.loading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {

        console.error('Order API error:', error);

        this.errorMessage =
          'Unable to load orders. Please check JSON Server.';

        this.loading = false;
        this.cdr.markForCheck();
      }

    });
  }

  // OPEN CANCEL CONFIRMATION
  confirmCancel(order: Order): void {

    if (
      order.status === 'Cancelled' ||
      order.id === undefined
    ) {
      return;
    }

    this.selectedOrderId = order.id;
    this.showCancelConfirmation = true;
  }

  // CLOSE CONFIRMATION
  closeCancelConfirmation(): void {

    if (this.cancelling) return;

    this.showCancelConfirmation = false;
    this.selectedOrderId = null;
  }

  // CONFIRM AND CANCEL ORDER
  cancelOrder(): void {

    if (
      this.selectedOrderId === null ||
      this.cancelling
    ) {
      return;
    }

    const orderId = this.selectedOrderId;

    this.cancelling = true;

    this.orderService.cancelOrder(orderId).subscribe({

      next: () => {

        this.orders = this.orders.map(item =>
          item.id === orderId
            ? { ...item, status: 'Cancelled' }
            : item
        );

        this.showCancelConfirmation = false;
        this.selectedOrderId = null;
        this.cancelling = false;

        this.notificationService.show(
          'Your order has been cancelled successfully.',
          'success'
        );

        this.cdr.markForCheck();

      },

      error: (error) => {

        console.error('Cancel order error:', error);

        this.errorMessage =
          'Unable to cancel this order. Please try again.';

        this.cancelling = false;

        this.notificationService.show(
          'Unable to cancel your order. Please try again.',
          'error'
        );

        this.cdr.markForCheck();

      }

    });
}

 
}