import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
  description: string;
  category: string;
  categoryId: string | null;
  categorySlug: string | null;
  image: string;
  quantity: number;
  sellerId: string | null;
  sellerName: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  rating: { rate: number; count: number };
}

export interface ProductMutationResult {
  ok: boolean;
  message?: string;
  product?: Product;
}

export interface ProductUpsertInput {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  quantity: number;
}

const API_BASE = 'http://localhost:3000/api';
const PRODUCTS_API = `${API_BASE}/products`;
const CARTS_API = `${API_BASE}/carts`;

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
    this.syncCartSummaryFromApi();
  }

  fetchProducts(): void {
    this._loading.set(true);
    this._error.set(null);

    this.http.get<any>(`${PRODUCTS_API}?page=1&limit=10`).subscribe({
      next: (res) => {
        const mapped: Product[] = this.extractProductsFromResponse(res).map((p) =>
          this.normalizeProduct(p),
        );
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

  getProductById(id: string): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  addProduct(data: ProductUpsertInput): Observable<ProductMutationResult> {
    const payload = this.toCreatePayload(data);

    return this.http.post<any>(PRODUCTS_API, payload, { headers: this.authHeaders() }).pipe(
      map((res) => {
        const created = this.extractSingleProduct(res);

        if (created && (created._id || created.id || created.title)) {
          const newProduct = this.normalizeProduct(created);
          this._products.update((ps) => [newProduct, ...ps]);
          return { ok: true, product: newProduct };
        }

        // Some APIs return success metadata only; refresh list to pull server state.
        this.fetchProducts();
        return { ok: true };
      }),
      catchError((err) => of({ ok: false, message: this.extractApiErrorMessage(err) })),
    );
  }

  updateProduct(id: string, data: Partial<ProductUpsertInput>): void {
    this.http.patch<any>(`${PRODUCTS_API}/${id}`, data, { headers: this.authHeaders() }).subscribe({
      next: (res) => {
        const updated = this.extractSingleProduct(res);
        const normalized = updated ? this.normalizeProduct(updated) : null;
        this._products.update((ps) =>
          ps.map((p) => (p.id === id ? { ...p, ...(normalized ?? data) } : p)),
        );
      },
      error: (err) => {
        console.warn('PATCH failed, updating locally', err);
        this._products.update((ps) => ps.map((p) => (p.id === id ? { ...p, ...data } : p)));
      },
    });
  }

  deleteProduct(id: string): void {
    this.http.delete(`${PRODUCTS_API}/${id}`, { headers: this.authHeaders() }).subscribe({
      next: () => {
        this._products.update((ps) => ps.filter((p) => p.id !== id));
      },
      error: (err) => {
        console.warn('DELETE failed, removing locally', err);
        this._products.update((ps) => ps.filter((p) => p.id !== id));
      },
    });
  }

  orderProduct(id: string, qty: number): void {
    const product = this._products().find((p) => p.id === id);
    if (!product || product.quantity < qty) return;

    this.http
      .post(
        CARTS_API,
        { productId: id },
        {
          headers: this.authHeaders(),
        },
      )
      .subscribe({
        next: () => this.syncCartSummaryFromApi(),
        error: (err) => console.warn('Cart API failed, keeping local cart behavior', err),
      });

    this._cartTotal.update((t) => +(t + product.price * qty).toFixed(2));
    this._cartItemCount.update((c) => c + qty);

    this._products.update((ps) =>
      ps.map((p) => (p.id === id ? { ...p, quantity: p.quantity - qty } : p)),
    );
  }

  syncCartSummaryFromApi(): void {
    this.http.get<any>(CARTS_API, { headers: this.authHeaders() }).subscribe({
      next: (res) => {
        const payload = res?.data ?? res ?? {};
        const cart = payload?.cart ?? payload;
        const products = Array.isArray(cart?.products)
          ? cart.products
          : Array.isArray(payload?.products)
            ? payload.products
            : [];

        const itemCount = products.reduce(
          (sum: number, p: any) => sum + Number(p?.quantity ?? 0),
          0,
        );
        const total = products.reduce(
          (sum: number, p: any) =>
            sum +
            Number(p?.quantity ?? 0) *
              Number(p?.price ?? p?.product?.discountPrice ?? p?.product?.price ?? 0),
          0,
        );

        this._cartItemCount.set(itemCount);
        this._cartTotal.set(+total.toFixed(2));
      },
      error: () => {
        this._cartItemCount.set(0);
        this._cartTotal.set(0);
      },
    });
  }

  resetCartSummary(): void {
    this._cartItemCount.set(0);
    this._cartTotal.set(0);
  }

  private authHeaders(): HttpHeaders {
    const token =
      sessionStorage.getItem('auth_token') ??
      sessionStorage.getItem('admin_token') ??
      sessionStorage.getItem('seller_token') ??
      sessionStorage.getItem('token') ??
      '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private toCreatePayload(data: ProductUpsertInput): Record<string, unknown> {
    const image = String(data.image ?? '').trim();
    const quantity = Number(data.quantity ?? 0);

    return {
      title: String(data.title ?? '').trim(),
      description: String(data.description ?? '').trim(),
      price: Number(data.price ?? 0),
      stock: quantity,
      category: String(data.category ?? '').trim(),
      images: image ? [image] : [],
    };
  }

  private extractApiErrorMessage(err: any): string {
    const status = Number(err?.status ?? 0);
    if (status === 403) {
      return 'Forbidden (403): this account cannot create products. Use an authorized seller/admin account.';
    }

    return (
      err?.error?.data?.message ??
      err?.error?.message ??
      err?.message ??
      'Failed to add product. Please check your admin login and input values.'
    );
  }

  private extractProductsFromResponse(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.products)) return res.products;
    if (Array.isArray(res?.data?.products)) return res.data.products;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    return [];
  }

  private extractSingleProduct(res: any): any | null {
    return res?.data ?? res?.product ?? res ?? null;
  }

  private normalizeProduct(raw: any): Product {
    const categoryValue =
      typeof raw?.category === 'string'
        ? raw.category
        : (raw?.category?.name ?? raw?.category?._id ?? 'general');

    const ratingValue =
      typeof raw?.rating === 'number'
        ? raw.rating
        : Number(raw?.rating?.rate ?? raw?.averageRating ?? 0);

    const firstImage = Array.isArray(raw?.photos)
      ? raw.photos[0]
      : Array.isArray(raw?.images)
        ? raw.images[0]
        : (raw?.imageURL ?? raw?.image ?? raw?.thumbnail ?? '');

    return {
      id: String(raw?._id ?? raw?.id ?? crypto.randomUUID()),
      title: String(raw?.title ?? 'Untitled Product'),
      price: Number(raw?.price ?? 0),
      discountPrice:
        raw?.discountPrice === null || raw?.discountPrice === undefined
          ? null
          : Number(raw.discountPrice),
      description: String(raw?.description ?? ''),
      category: categoryValue,
      categoryId: raw?.category?._id ? String(raw.category._id) : null,
      categorySlug: raw?.category?.slug ? String(raw.category.slug) : null,
      image: String(firstImage),
      quantity: Number(raw?.stock ?? raw?.quantity ?? 0),
      sellerId: raw?.seller?._id ? String(raw.seller._id) : null,
      sellerName: raw?.seller?.name ? String(raw.seller.name) : null,
      tags: Array.isArray(raw?.tags) ? raw.tags.map((tag: unknown) => String(tag)) : [],
      isActive: Boolean(raw?.isActive ?? true),
      createdAt: raw?.createdAt ? String(raw.createdAt) : null,
      updatedAt: raw?.updatedAt ? String(raw.updatedAt) : null,
      rating: {
        rate: Number(ratingValue),
        count: Number(raw?.ratingCount ?? raw?.reviewsCount ?? raw?.reviewCount ?? 0),
      },
    };
  }
}
