import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { Wishlist } from './features/wishlist/wishlist';
import { adminGuard } from './core/guards/admin-guard';
import { Layout } from './features/admin/layout/layout';

export const routes: Routes = [
 {
    path: '',
    loadComponent: () =>
      import('./features/home/home/home').then(m => m.Home)
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products/products').then(m => m.Products)
  },
  {
  path: 'products/:id',
  loadComponent: () =>
    import('./features/productdetails/productdetails')
      .then(m => m.Productdetails)
},
  {
    path: 'about',
    loadComponent: () =>
      import('./shared/pages/about').then(m => m.About)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.Register)
  },

  // Protected routes
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/cart/cart').then(m => m.Cart)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout').then(m => m.Checkout)
  },
  {
  path: 'profile',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/profile/profile/profile')
      .then(m => m.Profile)
},
{
  path: 'orders',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/orders/orders')
      .then(m => m.Orders)
},
{
  path: 'wishlist',
  component: Wishlist,
  canActivate: [authGuard]
},


// Admin routes
{
  path: 'admin',
  component:Layout,
  canActivate: [adminGuard],
  children: [
    {
      path: '',
      loadComponent: () =>
        import('./features/admin/dashboard/dashboard')
          .then(m => m.Dashboard)
    },
    {
      path: 'products',
      loadComponent: () =>
        import('./features/admin/products/products')
          .then(m => m.Products)
    },
    {
      path: 'orders',
      loadComponent: () =>
        import('./features/admin/orders/orders')
          .then(m => m.Orders)
    },
    {
      path: 'customers',
      loadComponent: () =>
        import('./features/admin/customers/customers')
          .then(m => m.Customers)
    },
    {
      path: 'discounts',
      loadComponent: () =>
        import('./features/admin/discounts/discounts')
      .then(m=>m.DiscountComponent)
    },
    {
      path: 'settings',
      loadComponent: () =>
        import('./features/admin/settings/settings')
          .then(m => m.Settings)
    }
  ]
},


 {
  path: 'not-found',
  loadComponent: () =>
    import('./features/not-found/not-found')
      .then(m => m.NotFound)
},

{
  path: '**',
  redirectTo: 'not-found'
},

];
