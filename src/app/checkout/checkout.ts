import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ElvoraApiService } from '../services/elvora-api.service';
import { ProductService } from '../services/product.service';

interface CheckoutItem {
  productId: string;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <h1>Checkout</h1>

      @if (loading()) {
        <p class="state">Loading checkout data...</p>
      } @else if (error()) {
        <p class="state error">{{ error() }}</p>
      } @else if (items().length === 0) {
        <p class="state">No items to checkout.</p>
      } @else {
        <div class="layout">
          <section class="items">
            @for (item of items(); track item.productId) {
              <div class="item">
                <img [src]="item.image" [alt]="item.title" />
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>Qty: {{ item.quantity }}</p>
                  <p>$ {{ item.price.toFixed(2) }}</p>
                </div>
              </div>
            }
          </section>

          <section class="checkout">
            <form [formGroup]="form" (ngSubmit)="submit()">
              <label>Shipping Address</label>
              <textarea rows="3" formControlName="shippingAddress"></textarea>
              @if (f['shippingAddress'].invalid && f['shippingAddress'].touched) {
                <span class="error-text">Shipping address is required.</span>
              }

              <label>Payment Method</label>
              <select formControlName="paymentMethod">
                <option value="cash">Cash</option>
                <option value="stripe">Stripe (Sandbox)</option>
              </select>

              <p class="totals">Total: $ {{ total().toFixed(2) }}</p>

              @if (submitError()) {
                <p class="error-text">{{ submitError() }}</p>
              }

              <button class="btn" type="submit" [disabled]="isSubmitting() || form.invalid">
                {{ isSubmitting() ? 'Processing...' : 'Place Order' }}
              </button>
            </form>
          </section>
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
      .items {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .item {
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 10px;
        display: grid;
        grid-template-columns: 80px 1fr;
        gap: 12px;
        background: #fff;
      }
      .item img {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        object-fit: cover;
      }
      .checkout {
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 14px;
        background: #fff;
        height: fit-content;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      textarea,
      select {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
      }
      .totals {
        font-size: 20px;
        font-weight: 700;
      }
      .btn {
        border: none;
        border-radius: 10px;
        padding: 12px;
        background: #6c63ff;
        color: #fff;
        font-weight: 700;
      }
      .error-text {
        color: #c62828;
        font-size: 13px;
      }
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CheckoutComponent implements OnInit {
  private api = inject(ElvoraApiService);
  private productSvc = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  submitError = signal<string | null>(null);
  isSubmitting = signal(false);

  mode = signal<'cart' | 'single'>('cart');
  items = signal<CheckoutItem[]>([]);

  total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));

  form = new FormGroup({
    shippingAddress: new FormControl('', [Validators.required, Validators.minLength(5)]),
    paymentMethod: new FormControl<'cash' | 'stripe'>('cash', Validators.required),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const mode = params.get('mode') === 'single' ? 'single' : 'cart';
      this.mode.set(mode);
      if (mode === 'single') {
        const productId = params.get('productId') ?? '';
        const quantity = Number(params.get('quantity') ?? '1');
        this.loadSingle(productId, quantity);
      } else {
        this.loadFromCart();
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    const shippingAddress = this.form.value.shippingAddress!;
    const paymentMethod = this.form.value.paymentMethod!;
    this.submitError.set(null);
    this.isSubmitting.set(true);

    if (paymentMethod === 'stripe') {
      sessionStorage.setItem(
        'pending_stripe_checkout',
        JSON.stringify({
          mode: this.mode(),
          items: this.items().map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      );

      this.api
        .createCheckoutSession({
          shippingAddress,
          products: this.items().map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        })
        .subscribe({
          next: (res: any) => {
            const url = res?.data?.url ?? res?.url;
            if (url) {
              window.location.href = url;
              return;
            }
            this.isSubmitting.set(false);
            this.submitError.set('Stripe session URL is missing.');
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.submitError.set(err?.error?.data?.message ?? 'Failed to start Stripe checkout.');
          },
        });
      return;
    }

    if (this.mode() === 'single') {
      const item = this.items()[0];
      this.api
        .checkoutSingle({
          productId: item.productId,
          quantity: item.quantity,
          shippingAddress,
          paymentMethod: 'cash',
        })
        .subscribe({
          next: () => {
            this.api.deleteCartProduct(item.productId).subscribe({
              next: () => this.productSvc.syncCartSummaryFromApi(),
              error: () => this.productSvc.syncCartSummaryFromApi(),
            });
            this.router.navigate(['/orders']);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.submitError.set(err?.error?.data?.message ?? 'Checkout failed.');
          },
        });
    } else {
      this.api
        .checkoutMultiple({
          fromCart: true,
          shippingAddress,
          paymentMethod: 'cash',
        })
        .subscribe({
          next: () => {
            this.productSvc.resetCartSummary();
            this.router.navigate(['/orders']);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.submitError.set(err?.error?.data?.message ?? 'Checkout failed.');
          },
        });
    }
  }

  private loadFromCart(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getMyCart().subscribe({
      next: (res: any) => {
        const payload = res?.data ?? res ?? {};
        const cart = payload?.cart ?? payload;
        const rawItems = Array.isArray(cart?.products)
          ? cart.products
          : Array.isArray(payload?.products)
            ? payload.products
            : [];

        const parsed = rawItems.map((item: any) => {
          const product = item?.product ?? {};
          const image = Array.isArray(product?.photos)
            ? product.photos[0]
            : Array.isArray(product?.images)
              ? product.images[0]
              : (product?.imageURL ?? product?.image ?? '');

          return {
            productId: String(product?._id ?? product?.id ?? item?.productId ?? ''),
            title: String(product?.title ?? product?.name ?? 'Product'),
            image: String(image),
            quantity: Number(item?.quantity ?? 1),
            price: Number(item?.price ?? product?.discountPrice ?? product?.price ?? 0),
          };
        });

        this.items.set(parsed);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.data?.message ?? 'Failed to load cart items.');
        this.loading.set(false);
      },
    });
  }

  private loadSingle(productId: string, quantity: number): void {
    if (!productId) {
      this.error.set('Product not selected.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.getProductById(productId).subscribe({
      next: (res: any) => {
        const product = res?.data ?? res?.product ?? res ?? {};
        const image = Array.isArray(product?.photos)
          ? product.photos[0]
          : Array.isArray(product?.images)
            ? product.images[0]
            : (product?.imageURL ?? product?.image ?? '');

        this.items.set([
          {
            productId: String(product?._id ?? product?.id ?? productId),
            title: String(product?.title ?? product?.name ?? 'Product'),
            image: String(image),
            quantity: Math.max(1, quantity),
            price: Number(product?.discountPrice ?? product?.price ?? 0),
          },
        ]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.data?.message ?? 'Failed to load product.');
        this.loading.set(false);
      },
    });
  }
}
