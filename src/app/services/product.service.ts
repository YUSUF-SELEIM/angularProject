import { Injectable, signal } from '@angular/core';
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  quantity: number; // stock remaining
  rating: { rate: number; count: number };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private _products = signal<Product[]>([]);
  private _loading = signal(true);
  private _cartTotal = signal(0);
  private _cartItemCount = signal(0);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly cartTotal = this._cartTotal.asReadonly();
  readonly cartItemCount = this._cartItemCount.asReadonly();

  constructor() {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this._loading.set(true);
    fetch('https://fakestoreapi.com/products?limit=10')
      .then((r) => r.json())
      .then((data: any[]) => {
        const mapped: Product[] = data.map((p) => ({ ...p, quantity: 10 }));
        this._products.set(mapped);
        this._loading.set(false);
      })
      .catch(() => this._loading.set(false));
  }

  getProductById(id: number): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  orderProduct(id: number, qty: number): void {
    const product = this._products().find((p) => p.id === id);
    if (!product || product.quantity < qty) return;

    this._cartTotal.update((t) => +(t + product.price * qty).toFixed(2));
    this._cartItemCount.update((c) => c + qty);

    this._products.update((ps) =>
      ps.map((p) => (p.id === id ? { ...p, quantity: p.quantity - qty } : p)),
    );
  }

  addProduct(data: Omit<Product, 'id' | 'rating'>): void {
    const newProduct: Product = {
      ...data,
      id: Date.now(), // simple unique id
      rating: { rate: 0, count: 0 },
    };
    // Prepend so new products appear first in the list
    this._products.update((ps) => [newProduct, ...ps]);
  }
}
