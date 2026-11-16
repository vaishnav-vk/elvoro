import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Product } from '../../../core/models/product.model';
import { loadProducts } from '../../../store/products/products.action';
import { addProduct,updateProduct,deleteProduct } from '../../../store/products/products.action';
import {
  selectAllProducts,
  selectProductsLoading,
  selectProductsError
} from '../../../store/products/products.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe,FormsModule,CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {

  private store = inject(Store);

  products$ = this.store.select(selectAllProducts);
  loading$ = this.store.select(selectProductsLoading);
  error$ = this.store.select(selectProductsError);

  searchText = '';
  selectedCategory = 'All';
  selectedBrand = 'All';
  sortOrder = 'default';


  addFormSubmitted=false;
  editFormSubmitted=false;

  availableSizes: number[] = [6, 7, 8, 9, 10, 11];

  currentPage = 1;
  pageSize = 8;

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
  }

  getCategories(products: Product[]): string[] {
    return [...new Set(products.map(p => p.category))].sort();
  }

  getBrands(products: Product[]): string[] {
    return [...new Set(products.map(p => p.brand))].sort();
  }

  filterProducts(products: Product[]): Product[] {
    const search = this.searchText.trim().toLowerCase();

    let result = products.filter(product => {
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
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (this.sortOrder === 'high-low') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (this.sortOrder === 'name') {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }

  getPaginatedProducts(products: Product[]): Product[] {
    const filtered = this.filterProducts(products);
    const start = (this.currentPage - 1) * this.pageSize;

    return filtered.slice(start, start + this.pageSize);
  }

  getTotalPages(products: Product[]): number {
    return Math.ceil(
      this.filterProducts(products).length / this.pageSize
    );
  }

  changePage(page: number, products: Product[]): void {
    const total = this.getTotalPages(products);

    if (page >= 1 && page <= total) {
      this.currentPage = page;
    }
  }

  onSearch(value: string): void {
    this.searchText = value;
    this.currentPage = 1;
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.currentPage = 1;
  }

  onBrandChange(value: string): void {
    this.selectedBrand = value;
    this.currentPage = 1;
  }

  onSortChange(value: string): void {
    this.sortOrder = value;
    this.currentPage = 1;
  }

  trackById(index: number, product: Product): string {
    return product.id;
  }

  showAddForm = false;

newProduct = {
  name: '',
  brand: '',
  price: 0,
  image: '',
  category: '',
  description: '',
  sizes: [6, 7, 8, 9, 10, 11],
  specifications: {
    material: '',
    sole: '',
    color: '',
    closure: '',
    weight: '',
    occasion: '',
    countryOfOrigin: ''
  }
};

openAddForm(): void {
  this.addFormSubmitted = false;
  this.showAddForm = true;
}

closeAddForm(): void {
  this.addFormSubmitted = false;
  this.showAddForm = false;
  this.resetForm();
}

saveProduct(): void {
   this.addFormSubmitted = true;
  if (
    !this.newProduct.name.trim() ||
    this.newProduct.name.trim().length < 3 ||
    !this.newProduct.brand.trim() ||
    !this.newProduct.category ||
    !this.newProduct.image.trim() ||
    !/^https?:\/\/.+/i.test(this.newProduct.image.trim()) ||
    !this.newProduct.description.trim() ||
    this.newProduct.description.trim().length < 10 ||
    !Number.isFinite(Number(this.newProduct.price)) ||
    Number(this.newProduct.price) <= 0 ||
    this.newProduct.sizes.length === 0
  ) {
    alert('Please fill in all required product details.');
    return;
  }

  this.store.dispatch(
    addProduct({
      product: this.newProduct
    })
  );

  this.showAddForm = false;
  this.resetForm();
}

resetForm(): void {
  this.newProduct = {
    name: '',
    brand: '',
    price: 0,
    image: '',
    category: '',
    description: '',
    sizes: [6, 7, 8, 9, 10, 11],
    specifications: {
      material: '',
      sole: '',
      color: '',
      closure: '',
      weight: '',
      occasion: '',
      countryOfOrigin: ''
    }
  };
}



//view update delete
showViewModal = false;
showEditForm = false;
showDeleteModal = false;

selectedProduct: Product | null = null;
productToDelete: Product | null = null;

editProduct: Product = this.createEmptyProduct();

private createEmptyProduct(): Product {
  return {
    id: '',
    name: '',
    brand: '',
    price: 0,
    image: '',
    category: '',
    description: '',
    sizes: [6, 7, 8, 9, 10, 11],
    specifications: {
      material: '',
      sole: '',
      color: '',
      closure: '',
      weight: '',
      occasion: '',
      countryOfOrigin: ''
    }
  };
}

// VIEW PRODUCT
viewProduct(product: Product): void {
  this.selectedProduct = product;
  this.showViewModal = true;
}

closeViewModal(): void {
  this.showViewModal = false;
  this.selectedProduct = null;
}

// OPEN EDIT FORM
openEditForm(product: Product): void {
  this.editFormSubmitted = false;
  this.selectedProduct = product;
  this.editProduct = { ...product };
  this.showEditForm = true;
}

closeEditForm(): void {
  this.editFormSubmitted = false;
  this.showEditForm = false;
}

// UPDATE PRODUCT
saveEditProduct(): void {
  this.editFormSubmitted = true;  
  if (
    !this.editProduct.name.trim() ||
    this.editProduct.name.trim().length < 3 ||
    !this.editProduct.brand.trim() ||
    !this.editProduct.category ||
    !this.editProduct.image.trim() ||
    !/^https?:\/\/.+/i.test(this.editProduct.image.trim()) ||
    !this.editProduct.description.trim() ||
    this.editProduct.description.trim().length < 10 ||
    !Number.isFinite(Number(this.editProduct.price)) ||
    Number(this.editProduct.price) <= 0 ||
    this.editProduct.sizes.length === 0
  ) {
    alert('Please fill in all required fields.');
    return;
  }

  this.store.dispatch(
    updateProduct({
      product: this.editProduct
    })
  );

  this.showEditForm = false;
}

// OPEN DELETE CONFIRMATION
openDeleteModal(product: Product): void {
  this.productToDelete = product;
  this.showDeleteModal = true;
}

closeDeleteModal(): void {
  this.showDeleteModal = false;
  this.productToDelete = null;
}

// CONFIRM DELETE
confirmDelete(): void {
  if (!this.productToDelete) return;

  this.store.dispatch(
    deleteProduct({
      id: this.productToDelete.id
    })
  );

  this.closeDeleteModal();

  // Prevent pagination from pointing to an empty page
  if (this.currentPage > 1) {
    this.currentPage = Math.min(
      this.currentPage,
      Math.ceil(
        (this.storeProductsCount - 1) / this.pageSize
      ) || 1
    );
  }
}

get storeProductsCount(): number {
  let count = 0;

  this.store.select(selectAllProducts).subscribe(products => {
    count = products.length;
  }).unsubscribe();

  return count;
}

toggleAddSize(size: number, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    if (!this.newProduct.sizes.includes(size)) {
      this.newProduct.sizes = [...this.newProduct.sizes, size].sort();
    }
  } else {
    this.newProduct.sizes =
      this.newProduct.sizes.filter(s => s !== size);
  }
}

// Edit product size selection
toggleEditSize(size: number, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    if (!this.editProduct.sizes.includes(size)) {
      this.editProduct.sizes = [...this.editProduct.sizes, size].sort();
    }
  } else {
    this.editProduct.sizes =
      this.editProduct.sizes.filter(s => s !== size);
  }
}
}
