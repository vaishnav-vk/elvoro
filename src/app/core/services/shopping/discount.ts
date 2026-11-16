import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Discount } from '../../models/discount.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn:'root'
})
export class DiscountService {
    private http=inject(HttpClient)

    private api = 'http://localhost:3000/discounts';

    getDiscounts(){
        return this.http.get<Discount[]>(this.api)
    }

    addDiscount(data:Discount):Observable<Discount>{
        return this.http.post<Discount>(this.api,data)

    }

    updateDiscount(id:string|number,data:Discount):Observable<Discount>{
        return this.http.put<Discount>(
            `${this.api}/${id}`,
            data
        )

    }
    deleteDiscount(id: string | number): Observable<void> {
  return this.http.delete<void>(`${this.api}/${id}`);
}


}
