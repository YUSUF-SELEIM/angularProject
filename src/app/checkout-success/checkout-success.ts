import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ElvoraApiService } from '../services/elvora-api.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      @if (loading()) {
        <h2>Confirming payment...</h2>
      } @else if (error()) {
        <h2>Payment confirmation failed</h2>
        <p>{{ error() }}</p>
        <a routerLink="/checkout" class="btn">Back to checkout</a>
      } @else {
        <h2>Payment successful</h2>
        <p>Your Stripe sandbox payment is confirmed and order is created.</p>
        @if (orderId()) {
          <p><strong>Order ID:</strong> {{ orderId() }}</p>
        }
        <div class="actions">
          <a routerLink="/orders" class="btn">View Orders</a>
          <a routerLink="/" class="btn secondary">Home</a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 680px;
        margin: 0 auto;
        padding: 40px 24px;
        text-align: center;
      }
      .actions {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      .btn {
        padding: 10px 16px;
        border-radius: 10px;
        background: #6c63ff;
        color: #fff;
        text-decoration: none;
      }
      .btn.secondary {
        background: #546e7a;
      }
    `,
  ],
})
export class CheckoutSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ElvoraApiService);
  private productSvc = inject(ProductService);

  loading = signal(true);
  error = signal<string | null>(null);
  orderId = signal<string | null>(null);

  ngOnInit(): void {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (!sessionId) {
      this.error.set('Stripe session id is missing.');
      this.loading.set(false);
      return;
    }

    this.api.confirmPayment(sessionId).subscribe({
      next: (res: any) => {
        const order = res?.data?.order ?? res?.order;
        this.orderId.set(String(order?._id ?? order?.id ?? ''));

        const pendingRaw = sessionStorage.getItem('pending_stripe_checkout');
        if (pendingRaw) {
          const pending = JSON.parse(pendingRaw) as {
            mode?: 'cart' | 'single';
            items?: Array<{ productId: string; quantity: number }>;
          };

          if (pending.mode === 'cart') {
            this.api.clearCart().subscribe({
              next: () => this.productSvc.resetCartSummary(),
              error: () => this.productSvc.syncCartSummaryFromApi(),
            });
          } else {
            const selected = pending.items?.[0]?.productId;
            if (selected) {
              this.api.deleteCartProduct(selected).subscribe({
                next: () => this.productSvc.syncCartSummaryFromApi(),
                error: () => this.productSvc.syncCartSummaryFromApi(),
              });
            } else {
              this.productSvc.syncCartSummaryFromApi();
            }
          }

          sessionStorage.removeItem('pending_stripe_checkout');
        }

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.data?.message ?? 'Unable to confirm payment.');
        this.loading.set(false);
      },
    });
  }
}
