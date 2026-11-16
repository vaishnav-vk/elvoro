export interface productSpecifications{
  material:string;
  sole:string;
  color:string;
  closure:string;
  weight:string;
  occasion:string;
  countryOfOrigin:string;
}





export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  description: string;
  sizes: number[];
  specifications:productSpecifications;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: number;
}
