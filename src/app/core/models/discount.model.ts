export interface Discount{
    id?:string|number;
    code:string;
    type:'percentage'|'fixed';
    value:number;
    minOrder:number;
    maxDiscount:number;
    expiryDate:string;
    usageLimit:number;
    usageCount:number
    status:'active'|'inactive';
}