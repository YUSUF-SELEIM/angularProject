import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';


export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  quantity: number;
  rating: { rate: number; count: number };
}

const API = 'https://fakestoreapi.com/products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  private _products = signal<Product[]>([]);
  private _loading = signal(true);
  private _error = signal<string | null>(null);
  private _cartTotal = signal(0);
  private _cartItemCount = signal(0);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly cartTotal = this._cartTotal.asReadonly();
  readonly cartItemCount = this._cartItemCount.asReadonly();

  constructor() {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http.get<any[]>(`${API}?limit=10`).subscribe({
      next: (data) => {
        const mapped: Product[] = data.map((p) => ({ ...p, quantity: 10 }));
        this._products.set(mapped);
        this._loading.set(false);
      },
      error: (err) => {
        this._error.set('Failed to load products. Please try again.');
        this._loading.set(false);
        console.error(err);
      },
    });
  }

  getProductById(id: number): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  addProduct(data: Omit<Product, 'id' | 'rating'>): void {
    this.http.post<any>(API, data).subscribe({
      next: (res) => {
        const newProduct: Product = {
          ...data,
          id: res.id ?? Date.now(),
          rating: { rate: 0, count: 0 },
        };
        this._products.update((ps) => [newProduct, ...ps]);
      },
      error: (err) => {
        console.warn('POST failed, adding locally', err);
        const newProduct: Product = {
          ...data,
          id: Date.now(),
          rating: { rate: 0, count: 0 },
        };
        this._products.update((ps) => [newProduct, ...ps]);
      },
    });
  }

  updateProduct(id: number, data: Partial<Omit<Product, 'id' | 'rating'>>): void {
    this.http.put<any>(`${API}/${id}`, data).subscribe({
      next: () => {
        this._products.update((ps) => ps.map((p) => (p.id === id ? { ...p, ...data } : p)));
      },
      error: (err) => {
        console.warn('PUT failed, updating locally', err);
        this._products.update((ps) => ps.map((p) => (p.id === id ? { ...p, ...data } : p)));
      },
    });
  }

  deleteProduct(id: number): void {
    this.http.delete(`${API}/${id}`).subscribe({
      next: () => {
        this._products.update((ps) => ps.filter((p) => p.id !== id));
      },
      error: (err) => {
        console.warn('DELETE failed, removing locally', err);
        this._products.update((ps) => ps.filter((p) => p.id !== id));
      },
    });
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
}
