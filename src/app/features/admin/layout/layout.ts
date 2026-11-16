import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  RouterLink,
  RouterLinkActive,
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth';
import { filter, Subscription } from 'rxjs';

@Component({
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private router = inject(Router);

  private routerSubscription?: Subscription;

  adminName = this.authService.currentUser?.name || 'Administrator';

  // Dynamic header title
  pageTitle = 'Elvoro Dashboard';

  // Controls logout popup
  showLogoutModal = false;

  ngOnInit(): void {

    // Set title for the current page immediately
    this.updatePageTitle(this.router.url);

    // Listen for navigation changes
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event) => {

        const navigation = event as NavigationEnd;

        this.updatePageTitle(navigation.urlAfterRedirects);

      });
  }

  // Update header based on selected admin page
  updatePageTitle(url: string): void {

    if (url.includes('/admin/products')) {
      this.pageTitle = 'Product Management';

    } else if (url.includes('/admin/orders')) {
      this.pageTitle = 'Order Management';

    } else if (url.includes('/admin/customers')) {
      this.pageTitle = 'Customer Management';

    } else if (url.includes('/admin/discounts')) {
      this.pageTitle = 'Discount Management';

    } else if (url.includes('/admin/settings')) {
      this.pageTitle = 'Settings';

    } else {
      this.pageTitle = 'Elvoro Dashboard';
    }
  }

  // Open confirmation popup
  logout(): void {
    this.showLogoutModal = true;
  }

  // Close confirmation popup
  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  // Confirm logout
  confirmLogout(): void {

    this.showLogoutModal = false;

    this.authService.logOut();

    this.router.navigate(['/login']);
  }

  // Unsubscribe to prevent memory leaks
  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

}