import { Component,inject,OnInit,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration,ChartType } from 'chart.js';
import { RouterLink } from '@angular/router';


interface Product {
  id: string | number;
  name: string;
  brand?: string;
  category?: string;
  price?: number;
  image?: string;
  sizes?: number[];
  stock?: number;
  quantity?: number;
}

interface Order {
  id: string | number;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  userName?: string;

  finalTotal?: number;
  subtotal?: number;
  total?: number;
  totalAmount?: number;

  status?: string;

  orderDate?: string;
  date?: string;
  createdAt?: string;

  items?: any[];
}

@Component({
  imports: [CommonModule,BaseChartDirective,RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
   private http = inject(HttpClient);

  products: Product[] = [];
  orders: Order[] = [];
  customers: any[] = [];

  totalRevenue = 0;
  totalOrders = 0;
  totalProducts = 0;
  totalCustomers = 0;

  loading = signal(true)
  errorMessage = '';

  // Sales Overview
  salesType: 'line' = 'line';

  salesData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Revenue',
      data: [],
      borderColor: '#171717',
      backgroundColor: 'rgba(23,23,23,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4
    }]
  };

  salesOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => '₹' + value
        }
      }
    }
  };

  // Products by Category
  categoryType: 'doughnut' = 'doughnut';

  categoryData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#171717', '#3b82f6', '#a855f7',
        '#16a34a', '#f59e0b', '#ef4444'
      ],
      borderWidth: 2
    }]
  };

  categoryOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // Orders by Status
  statusType: 'bar' = 'bar';

  statusData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      label: 'Orders',
      data: [],
      backgroundColor: [
        '#f59e0b', '#3b82f6', '#a855f7',
        '#16a34a', '#ef4444'
      ],
      borderRadius: 6,
      barThickness: 28
    }]
  };

  statusOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
  this.loading.set(true);
  this.errorMessage = '';

  forkJoin({
    products: this.http.get<Product[]>('http://localhost:3000/products'),
    orders: this.http.get<Order[]>('http://localhost:3000/orders'),
    users: this.http.get<any[]>('http://localhost:3000/users')
  }).subscribe({
    next: ({ products, orders, users }) => {

      this.products = products;
      this.orders = orders;

      this.customers = users.filter(
        user => user.role !== 'admin'
      );

      this.calculateDashboard();

      this.loading.set(false);

      console.log('Dashboard loaded successfully');
    },

    error: (error) => {
      console.error('API Error:', error);

      this.errorMessage = 'Unable to load dashboard data.';
      this.loading.set(false);
    }
  });
}

 getOrderTotal(order: Order): number {

  // Your actual Order model
  if (order.finalTotal != null) {
    return Number(order.finalTotal) || 0;
  }

  // Other possible order formats
  if (order.totalAmount != null) {
    return Number(order.totalAmount) || 0;
  }

  if (order.total != null) {
    return Number(order.total) || 0;
  }

  // Calculate from your actual CartItem structure
  return (order.items || []).reduce((sum: number, item: any) => {
    const price = Number(item.product?.price ?? item.price ?? 0);
    const quantity = Number(item.quantity ?? 1);

    return sum + price * quantity;
  }, 0);
}

 getOrderDate(order: Order): Date | null {

  const value =
    order.orderDate ||
    order.date ||
    order.createdAt;

  if (!value) return null;

  const date = new Date(value);

  return isNaN(date.getTime()) ? null : date;
}

  calculateDashboard(): void {
    this.totalProducts = this.products.length;
    this.totalOrders = this.orders.length;
    this.totalCustomers = this.customers.length;

    this.totalRevenue = this.orders
      .filter(order =>
        order.status?.toLowerCase() !== 'cancelled'
      )
      .reduce((sum, order) =>
        sum + this.getOrderTotal(order), 0
      );

    this.createSalesChart();
    this.createCategoryChart();
    this.createStatusChart();
  }

  createSalesChart(): void {
    const monthlyRevenue = new Map<string, number>();

    this.orders.forEach(order => {
      if (order.status?.toLowerCase() === 'cancelled') {
        return;
      }

      const date = this.getOrderDate(order);

      if (!date) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      monthlyRevenue.set(
        key,
        (monthlyRevenue.get(key) || 0) + this.getOrderTotal(order)
      );
    });

    const entries = [...monthlyRevenue.entries()]
      .sort((a, b) => {
        const [yearA, monthA] = a[0].split('-').map(Number);
        const [yearB, monthB] = b[0].split('-').map(Number);

        return yearA - yearB || monthA - monthB;
      });

    this.salesData = {
      labels: entries.map(([key]) => {
        const [year, month] = key.split('-').map(Number);

        return new Date(year, month).toLocaleString('en-US', {
          month: 'short',
          year: 'numeric'
        });
      }),
      datasets: [{
        label: 'Revenue',
        data: entries.map(([, amount]) => amount),
        borderColor: '#171717',
        backgroundColor: 'rgba(23,23,23,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    };
  }

  createCategoryChart(): void {
    const counts = new Map<string, number>();

    this.products.forEach(product => {
      const category = product.category || 'Other';

      counts.set(
        category,
        (counts.get(category) || 0) + 1
      );
    });

    this.categoryData = {
      labels: [...counts.keys()],
      datasets: [{
        data: [...counts.values()],
        backgroundColor: [
          '#171717', '#3b82f6', '#a855f7',
          '#16a34a', '#f59e0b', '#ef4444'
        ],
        borderWidth: 2
      }]
    };
  }

  createStatusChart(): void {
    const statuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled'
    ];

    const counts = statuses.map(status =>
      this.orders.filter(order =>
        order.status?.toLowerCase() === status
      ).length
    );

    this.statusData = {
      labels: statuses.map(status =>
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [{
        label: 'Orders',
        data: counts,
        backgroundColor: [
          '#f59e0b', '#3b82f6', '#a855f7',
          '#16a34a', '#ef4444'
        ],
        borderRadius: 6,
        barThickness: 28
      }]
    };
  }

  get recentOrders(): Order[] {
    return [...this.orders]
      .sort((a, b) => {
        const dateA = this.getOrderDate(a)?.getTime() || 0;
        const dateB = this.getOrderDate(b)?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }

  get lowStockProducts(): Product[] {
    return this.products.filter(product => {
      if (product.stock != null) {
        return Number(product.stock) <= 5;
      }

      if (product.quantity != null) {
        return Number(product.quantity) <= 5;
      }

      return false;
    });
  }

  getStock(product: Product): number {
    return Number(product.stock ?? product.quantity ?? 0);
  }
}
