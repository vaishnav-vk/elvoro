
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SavedAddress {
  id?: string | number;
  userId: string | number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/address';

  // 1. Get address by user ID
  getAddress(userId: string | number): Observable<SavedAddress[]> {
    return this.http.get<SavedAddress[]>(
      `${this.apiUrl}?userId=${encodeURIComponent(String(userId))}`
    );
  }

  // 2. Save a new address
  saveAddress(
    address: Omit<SavedAddress, 'id'>
  ): Observable<SavedAddress> {
    return this.http.post<SavedAddress>(
      this.apiUrl,
      address
    );
  }

  // 3. Update an existing address
  updateAddress(
    id: string | number,
    address: Partial<SavedAddress>
  ): Observable<SavedAddress> {
    return this.http.patch<SavedAddress>(
      `${this.apiUrl}/${id}`,
      address
    );
  }

  // 4. Delete an address
  deleteAddress(id: string | number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
