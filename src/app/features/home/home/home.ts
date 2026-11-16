import { Component,OnInit,inject } from '@angular/core';
import { AsyncPipe,DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Product } from '../../../core/models/product.model';
import { loadProducts } from '../../../store/products/products.action';
import { selectAllProducts } from '../../../store/products/products.selectors';
import { addToCart } from '../../../store/cart/cart.action';


@Component({
  imports: [AsyncPipe,RouterLink,DecimalPipe],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private store=inject(Store)
   products$ = this.store.select(selectAllProducts);

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
  }

  addProductToCart(product: Product): void {
    const size = product.sizes?.[0];

    if (size === undefined) {
      return;
    }

    this.store.dispatch(addToCart({ product, size }));
  }


}
