
import { Component, OnInit, inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../../core/services/shared/order';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {

  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  // Orders data
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  // Loading and error
  loading = false;
  errorMessage = '';

  // Search and filter
  searchTerm = '';
  selectedStatus = 'All';

  // Pagination
  currentPage = 1;
  pageSize = 8;

  // Selected order
  selectedOrder: Order | null = null;

  // Modal visibility
  showViewModal = false;
  showDeleteModal = false;

  // Order to delete
  orderToDelete: Order | null = null;

  // Available statuses
  statuses: Order['status'][] = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  // Fetch all orders
  loadOrders(): void {
  this.loading = true;
  this.errorMessage = '';

  this.orderService.getAllOrders().subscribe({
    next: (data) => {
      console.log('Orders received:', data);

      this.orders = data;
      this.applyFilters();

      this.loading = false;

      // Refresh the UI
      this.cdr.markForCheck();
    },

    error: (error) => {
      console.error('Error loading orders:', error);

      this.errorMessage = 'Unable to load orders.';
      this.loading = false;

      this.cdr.markForCheck();
    }
  });
}

  // Search and filter
  applyFilters(): void {
    let result = [...this.orders];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();

      result = result.filter(order =>
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatus !== 'All') {
      result = result.filter(
        order => order.status === this.selectedStatus
      );
    }

    this.filteredOrders = result;
    this.currentPage = 1;
  }

  // Search change
  onSearchChange(): void {
    this.applyFilters();
  }

  // Status filter change
  onStatusChange(): void {
    this.applyFilters();
  }

  // Statistics
  get totalOrders(): number {
    return this.orders.length;
  }

  get pendingOrders(): number {
    return this.orders.filter(
      order => order.status === 'Pending'
    ).length;
  }

  get deliveredOrders(): number {
    return this.orders.filter(
      order => order.status === 'Delivered'
    ).length;
  }

  get totalRevenue(): number {
    return this.orders
      .filter(order => order.status !== 'Cancelled')
      .reduce((total, order) => total + order.finalTotal, 0);
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.pageSize);
  }

  get paginatedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredOrders.slice(
      start,
      start + this.pageSize
    );
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // View order
  viewOrder(order: Order): void {
    this.selectedOrder = order;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedOrder = null;
  }

  // Update status
  updateStatus(order: Order, status: Order['status']): void {
    if (order.id === undefined) {
      this.errorMessage = 'Order ID is missing.';
      return;
    }

    this.orderService.updateOrderStatus(order.id, status).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(
          item => item.id === updatedOrder.id
        );

        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }

        if (this.selectedOrder?.id === updatedOrder.id) {
          this.selectedOrder = updatedOrder;
        }

        this.applyFilters();
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.errorMessage = 'Unable to update order status.';
      }
    });
  }

  // Open delete confirmation
  openDeleteModal(order: Order): void {
    this.orderToDelete = order;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.orderToDelete = null;
  }

  // Delete order
  confirmDelete(): void {
    if (this.orderToDelete?.id === undefined) {
      return;
    }

    const id = this.orderToDelete.id;

    this.orderService.deleteOrder(id).subscribe({
      next: () => {
        this.orders = this.orders.filter(
          order => order.id !== id
        );

        this.applyFilters();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting order:', error);
        this.errorMessage = 'Unable to delete order.';
      }
    });
  }
}
