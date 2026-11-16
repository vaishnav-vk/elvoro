import { Injectable } from '@angular/core';

@Injectable({
    providedIn:'root'
})
export class LocalstorageServices {
    saveData(key:string,data:any):void{
        localStorage.setItem(key,JSON.stringify(data))
    }

    getData<T>(key:string):T | null{
        const data=localStorage.getItem(key)
        return data ? JSON.parse(data) as T :null
        }

    removeData(key:string):void{
        localStorage.removeItem(key)

    }
}
