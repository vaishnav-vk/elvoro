
import { Component, OnInit, inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth/auth';
import {
  SafeUser,
  UserStatus
} from '../../../core/models/user.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class Customers implements OnInit {

  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // Customer data
  customers: SafeUser[] = [];
  filteredCustomers: SafeUser[] = [];

  // Loading and error
  loading = false;
  errorMessage = '';

  // Search and filter
  searchTerm = '';
  selectedStatus = 'all';

  // Pagination
  currentPage = 1;
  pageSize = 8;

  // Selected customer
  selectedCustomer: SafeUser | null = null;

  // Modal controls
  showViewModal = false;
  showStatusModal = false;

  customerToUpdate: SafeUser | null = null;
  newStatus: UserStatus = 'active';

  ngOnInit(): void {
    this.loadCustomers();
  }

  // Fetch customers
  loadCustomers(): void {

    this.loading = true;
    this.errorMessage = '';

    this.authService.getAllCustomers().subscribe({

      next: (data) => {

        this.customers = data;

        this.applyFilters();

        this.loading = false;

        this.cdr.detectChanges()
      },

      error: (error) => {

        console.error('Error loading customers:', error);

        this.errorMessage = 'Unable to load customers. Please try again.';

        this.loading = false;

        this.cdr.detectChanges();
      }

    });
  }

  // Search and filter customers
  applyFilters(): void {

    let result = [...this.customers];

    // Search by name or email
    if (this.searchTerm.trim()) {

      const search = this.searchTerm.toLowerCase().trim();

      result = result.filter(customer =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search)
      );

    }

    // Filter by status
    if (this.selectedStatus !== 'all') {

      result = result.filter(customer =>
        (customer.status ?? 'active') === this.selectedStatus
      );

    }

    this.filteredCustomers = result;

    this.currentPage = 1;
  }

  // Statistics
  get totalCustomers(): number {
    return this.customers.length;
  }

  get activeCustomers(): number {
    return this.customers.filter(
      customer => (customer.status ?? 'active') === 'active'
    ).length;
  }

  get blockedCustomers(): number {
    return this.customers.filter(
      customer => customer.status === 'blocked'
    ).length;
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredCustomers.length / this.pageSize);
  }

  get paginatedCustomers(): SafeUser[] {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredCustomers.slice(
      start,
      start + this.pageSize
    );
  }

  changePage(page: number): void {

    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  // View customer
  viewCustomer(customer: SafeUser): void {

    this.selectedCustomer = customer;

    this.showViewModal = true;
  }

  closeViewModal(): void {

    this.showViewModal = false;

    this.selectedCustomer = null;
  }

  // Open block/unblock confirmation
  openStatusModal(customer: SafeUser): void {

    this.customerToUpdate = customer;

    this.newStatus =
      customer.status === 'blocked' ? 'active' : 'blocked';

    this.showStatusModal = true;
  }

  closeStatusModal(): void {

    this.showStatusModal = false;

    this.customerToUpdate = null;
  }

  // Confirm block/unblock
  
confirmStatusUpdate(): void {

  const customer = this.customerToUpdate;

  if (!customer || customer.id === undefined) {
    return;
  }

  const userId = customer.id;

  this.authService.updateUserStatus(
    userId,
    this.newStatus
  ).subscribe({

    next: (updatedUser) => {

      this.customers = this.customers.map(user =>
        user.id === updatedUser.id
          ? {
              ...user,
              status: updatedUser.status ?? this.newStatus
            }
          : user
      );

      this.applyFilters();

      this.closeStatusModal();

      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error('Error updating customer status:', error);

      this.errorMessage =
        'Unable to update customer status. Please try again.';

      this.closeStatusModal();
    }

  });
}


  // Refresh customers
  refreshCustomers(): void {
    this.loadCustomers();
  }

}
