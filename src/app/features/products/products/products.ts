import { Component,OnInit,inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Product } from '../../../core/models/product.model';
import { loadProducts } from '../../../store/products/products.action';
import { selectAllProducts,
  selectProductsLoading,
  selectProductsError
 } from '../../../store/products/products.selectors';
 import { addToCart } from '../../../store/cart/cart.action';
 import { RouterLink } from '@angular/router';
 import { AuthService } from '../../../core/services/auth/auth';
 import { addToWishlist } from '../../../store/wishlist/wishlist.action';
 import { Router } from '@angular/router';
 import { selectWishlistItems } from '../../../store/wishlist/wishlist.selectors';
 import { Observable } from 'rxjs';
import { WishlistItem } from '../../../core/services/user/wishlist';
@Component({
  imports: [AsyncPipe,RouterLink],
  selector: 'app-products',
  styleUrl: './products.css',
  templateUrl: './products.html',
})
export class Products implements OnInit {
  private store=inject(Store)
  private authService=inject(AuthService)
  private router=inject(Router)

  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductsLoading);
  error$ = this.store.select(selectProductsError);

   searchText = '';
  selectedCategory = 'All';
  selectedBrand = 'All';
  sortOrder = 'default';

  selectedSizes: Record<string, number> = {};


  wishlistItems$: Observable<WishlistItem[]> =
  this.store.select(selectWishlistItems);

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
  }

   onSizeChange(productId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedSizes = {
      ...this.selectedSizes,
      [productId]: Number(select.value)
    };
  }

  getSelectedSize(product: Product): number {
    return this.selectedSizes[product.id] ?? product.sizes[0];
  }

  addProductToCart(product: Product): void {
    const size = this.getSelectedSize(product);

    if (!size) return;

    this.store.dispatch(addToCart({ product, size }));
  }




  filterProducts(products: Product[]): Product[] {
  const search = this.searchText.trim().toLowerCase();

  let filtered = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.brand.toLowerCase().includes(search);

    const matchesCategory =
      this.selectedCategory === 'All' ||
      product.category === this.selectedCategory;

    const matchesBrand =
      this.selectedBrand === 'All' ||
      product.brand === this.selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  if (this.sortOrder === 'low-high') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (this.sortOrder === 'high-low') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (this.sortOrder === 'name') {
    filtered = [...filtered].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  return filtered;
}



onSearch(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.searchText = input.value;
}

onCategoryChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  this.selectedCategory = select.value;
}

onBrandChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  this.selectedBrand = select.value;
}

onSortChange(event: Event): void {
  const select = event.target as HTMLSelectElement;
  this.sortOrder = select.value;
}

getBrands(products: Product[]): string[] {
  return [...new Set(products.map(product => product.brand))]
    .sort((a, b) => a.localeCompare(b));
}


currentPage = 1;
pageSize = 6;

getTotalPages(products: Product[]): number {
  return Math.ceil(
    this.filterProducts(products).length / this.pageSize
  );
}

getPaginatedProducts(products: Product[]): Product[] {
  const filtered = this.filterProducts(products);

  const startIndex = (this.currentPage - 1) * this.pageSize;

  return filtered.slice(
    startIndex,
    startIndex + this.pageSize
  );
}

getPages(products: Product[]): number[] {
  const total = this.getTotalPages(products);

  return Array.from(
    { length: total },
    (_, index) => index + 1
  );
}

changePage(page: number, products: Product[]): void {
  const totalPages = this.getTotalPages(products);

  if (page >= 1 && page <= totalPages) {
    this.currentPage = page;
  }
}

nextPage(products: Product[]): void {
  this.changePage(this.currentPage + 1, products);
}

previousPage(products: Product[]): void {
  this.changePage(this.currentPage - 1, products);
}

toggleWishlist(product: Product): void {

  const user = this.authService.currentUser;

  if (!user?.email) {
    this.router.navigate(['/login']);
    return;
  }

  this.store.dispatch(
    addToWishlist({
      product,
      userEmail: user.email
    })
  );

}
  

}
