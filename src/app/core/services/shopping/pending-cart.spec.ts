import { TestBed } from '@angular/core/testing';
import { PendingCart } from './pending-cart';

describe('PendingCart', () => {
  let service: PendingCart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingCart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
