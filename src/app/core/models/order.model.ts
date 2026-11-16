import { CartItem } from './product.model';

export interface Order {
  id?: string | number;
  orderNumber: string;

  userEmail: string;
  customerName: string;
  customerEmail: string;
  phone: string;

  address: string;
  city: string;
  state: string;
  pinCode: string;

  items: CartItem[];

  subtotal: number;
  discount: number;
  discountPercentage: number;
  finalTotal: number;

  paymentMethod: 'COD';

  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

  orderDate: string;
}