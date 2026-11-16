import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { loadCart } from './store/cart/cart.action';
import { Header } from './shared/header/header/header';
import { Footer } from './shared/footer/footer/footer';
import { filter, Subscription } from 'rxjs';

@Component({
  imports: [RouterOutlet, Footer, Header],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('my-app');

  private store = inject(Store);
  private router = inject(Router);

  showLayout = true;
  private routerSubscription?: Subscription;

  ngOnInit(): void {
    // Load cart from storage
    this.store.dispatch(loadCart());

    // Set layout based on the current route
    this.updateLayout(this.router.url);

    // Listen for route changes
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateLayout(event.urlAfterRedirects);
      });
  }

  private updateLayout(url: string): void {
    this.showLayout =
      !url.startsWith('/admin') &&
      url !== '/login' &&
      url !== '/register' &&
      !url.startsWith('/not-found');
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}