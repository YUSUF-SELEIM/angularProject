import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ElvoraApiService } from '../services/elvora-api.service';

interface CartProduct {
  id: string;
  title: string;
  image: string;
  price: number;
  stock: number;
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  product: CartProduct;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="head">
        <h1>My Cart</h1>
        <a routerLink="/" class="back">Continue shopping</a>
      </div>

      @if (loading()) {
        <p class="state">Loading cart...</p>
      } @else if (error()) {
        <p class="state error">{{ error() }}</p>
      } @else if (items().length === 0) {
        <p class="state">Your cart is empty.</p>
      } @else {
        <div class="layout">
          <section class="list">
            @for (item of items(); track item.productId) {
              <article class="row">
                <img [src]="item.product.image" [alt]="item.product.title" />
                <div class="meta">
                  <h3>{{ item.product.title }}</h3>
                  <p>$ {{ item.price.toFixed(2) }}</p>
                  <p class="stock">Stock: {{ item.product.stock }}</p>
                </div>
                <div class="qty">
                  <button (click)="decrement(item.productId)">-</button>
                  <span>{{ item.quantity }}</span>
                  <button (click)="increment(item.productId)">+</button>
                </div>
                <button class="remove" (click)="remove(item.productId)">Remove</button>
              </article>
            }
          </section>

          <aside class="summary">
            <h2>Summary</h2>
            <p>
              <span>Items</span><span>{{ totalItems() }}</span>
            </p>
            <p>
              <span>Total</span><span>$ {{ totalAmount().toFixed(2) }}</span>
            </p>

            <button class="btn" (click)="goToCheckout()">Proceed to Checkout</button>
            <button class="btn danger" (click)="clearAll()">Clear Cart</button>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1100px;
        margin: 0 auto;
        padding: 24px;
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .back {
        color: #6c63ff;
      }
      .state {
        text-align: center;
        color: #666;
      }
      .state.error {
        color: #c62828;
      }
      .layout {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 18px;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .row {
        display: grid;
        grid-template-columns: 80px 1fr auto auto;
        gap: 12px;
        align-items: center;
        padding: 12px;
        border: 1px solid #eee;
        border-radius: 12px;
        background: #fff;
      }
      .row img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
      }
      .meta h3 {
        margin: 0 0 6px;
        font-size: 16px;
      }
      .meta p {
        margin: 0;
      }
      .stock {
        color: #777;
        font-size: 12px;
      }
      .qty {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .qty button {
        width: 28px;
        height: 28px;
      }
      .remove {
        border: none;
        background: #fdecea;
        color: #c62828;
        padding: 8px 10px;
        border-radius: 8px;
      }
      .summary {
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 16px;
        background: #fff;
        height: fit-content;
      }
      .summary p {
        display: flex;
        justify-content: space-between;
      }
      .btn {
        width: 100%;
        margin-top: 8px;
        border: none;
        border-radius: 10px;
        padding: 10px;
        background: #6c63ff;
        color: #fff;
      }
      .btn.danger {
        background: #c62828;
      }
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .row {
          grid-template-columns: 70px 1fr;
        }
      }
    `,
  ],
})
export class CartComponent implements OnInit {
  private api = inject(ElvoraApiService);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  items = signal<CartItem[]>([]);

  totalItems = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  totalAmount = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getMyCart().subscribe({
      next: (res: any) => {
        this.items.set(this.extractCartItems(res));
        this.loading.set(false);
      },
      error: (err) => {
        const message = err?.error?.data?.message ?? 'Failed to load cart.';
        this.error.set(message);
        this.loading.set(false);
      },
    });
  }

  increment(productId: string): void {
    this.api.updateCartProductQuantity(productId, '+').subscribe({
      next: () => this.loadCart(),
      error: () => this.loadCart(),
    });
  }

  decrement(productId: string): void {
    this.api.updateCartProductQuantity(productId, '-').subscribe({
      next: () => this.loadCart(),
      error: () => this.loadCart(),
    });
  }

  remove(productId: string): void {
    this.api.deleteCartProduct(productId).subscribe({
      next: () => this.loadCart(),
      error: () => this.loadCart(),
    });
  }

  clearAll(): void {
    this.api.clearCart().subscribe({
      next: () => this.loadCart(),
      error: () => this.loadCart(),
    });
  }

  goToCheckout(): void {
    this.router.navigate(['/checkout'], { queryParams: { mode: 'cart' } });
  }

  private extractCartItems(res: any): CartItem[] {
    const payload = res?.data ?? res ?? {};
    const cart = payload?.cart ?? payload;
    const list = Array.isArray(cart?.products)
      ? cart.products
      : Array.isArray(payload?.products)
        ? payload.products
        : [];

    return list.map((item: any) => {
      const rawProduct = item?.product ?? {};
      const firstImage = Array.isArray(rawProduct?.photos)
        ? rawProduct.photos[0]
        : Array.isArray(rawProduct?.images)
          ? rawProduct.images[0]
          : (rawProduct?.imageURL ?? rawProduct?.image ?? rawProduct?.thumbnail ?? '');

      const price = Number(item?.price ?? rawProduct?.discountPrice ?? rawProduct?.price ?? 0);

      return {
        productId: String(rawProduct?._id ?? rawProduct?.id ?? item?.productId ?? ''),
        quantity: Number(item?.quantity ?? 1),
        price,
        product: {
          id: String(rawProduct?._id ?? rawProduct?.id ?? ''),
          title: String(rawProduct?.title ?? rawProduct?.name ?? 'Product'),
          image: String(firstImage),
          price: Number(rawProduct?.price ?? 0),
          stock: Number(rawProduct?.stock ?? 0),
        },
      };
    });
  }
}
