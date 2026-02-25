import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductService } from '../services/product.service';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="detail-page">
      <a class="back-link" routerLink="/">← Back to Products</a>

      @if (svc.loading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading…</p>
        </div>
      } @else if (!product()) {
        <div class="not-found">
          <h2>Product not found</h2>
          <a routerLink="/">Go home</a>
        </div>
      } @else {
        <div class="detail-grid">
          <div class="image-col">
            <div class="image-wrapper">
              <img [src]="product()!.image" [alt]="product()!.title" class="product-img" />
            </div>

            <div class="stock-info" [class]="stockClass()">
              @if (product()!.quantity <= 0) {
                <span>⛔ Out of Stock</span>
              } @else if (product()!.quantity === 1) {
                <span>⚠️ Last Item!</span>
              } @else {
                <span>✅ {{ product()!.quantity }} items in stock</span>
              }
            </div>
          </div>

          <div class="info-col">
            <p class="category">{{ product()!.category }}</p>
            <h1 class="title">{{ product()!.title }}</h1>

            <div class="rating">
              <span class="stars">★ {{ product()!.rating.rate }}</span>
              <span class="count">({{ product()!.rating.count }} reviews)</span>
            </div>

            <p class="description">{{ product()!.description }}</p>

            <div class="price-row">
              <span class="price">\${{ product()!.price }}</span>
              @if (orderQty() > 1) {
                <span class="subtotal">
                  Subtotal: \${{ (product()!.price * orderQty()).toFixed(2) }}
                </span>
              }
            </div>

            @if (product()!.quantity > 0) {
              <div class="qty-row">
                <label class="qty-label">Quantity:</label>
                <div class="stepper">
                  <button class="step-btn" (click)="decrement()" [disabled]="orderQty() <= 1">
                    −
                  </button>
                  <span class="qty-value">{{ orderQty() }}</span>
                  <button
                    class="step-btn"
                    (click)="increment()"
                    [disabled]="orderQty() >= product()!.quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            }

            <app-button
              [title]="buyLabel()"
              [color]="'#FF6B6B'"
              [disabled]="!canBuy()"
              (onClick)="handleOrder()"
            />

            @if (ordered()) {
              <div class="success-msg">
                ✅ {{ lastOrderQty() }} × {{ product()!.title }} added to cart!
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .detail-page {
        max-width: 1100px;
        margin: 0 auto;
        padding: 24px 20px;
      }

      .back-link {
        display: inline-block;
        margin-bottom: 24px;
        color: #ff6b6b;
        font-weight: 600;
        text-decoration: none;
        font-size: 15px;
        transition: letter-spacing 0.2s;

        &:hover {
          letter-spacing: 0.5px;
        }
      }

      .loading,
      .not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 60px;
        color: #666;
        font-size: 18px;
      }

      .spinner {
        width: 48px;
        height: 48px;
        border: 5px solid #eee;
        border-top-color: #ff6b6b;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
        align-items: start;
      }

      @media (max-width: 700px) {
        .detail-grid {
          grid-template-columns: 1fr;
        }
      }

      .image-wrapper {
        background: #f5f5f5;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 380px;
      }

      .product-img {
        width: 100%;
        max-height: 420px;
        object-fit: contain;
        padding: 24px;
      }

      .stock-info {
        margin-top: 16px;
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        text-align: center;
      }

      .stock-ok {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .stock-last {
        background: #fff3e0;
        color: #e65100;
      }
      .stock-none {
        background: #ffebee;
        color: #c62828;
      }

      .category {
        font-size: 13px;
        color: #999;
        text-transform: capitalize;
        margin: 0 0 8px;
      }

      .title {
        font-size: 26px;
        font-weight: 700;
        color: #2c3e50;
        margin: 0 0 12px;
        line-height: 1.3;
      }

      .rating {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }

      .stars {
        color: #ffc107;
        font-weight: 700;
        font-size: 16px;
      }
      .count {
        color: #999;
        font-size: 14px;
      }

      .description {
        font-size: 15px;
        color: #555;
        line-height: 1.6;
        margin-bottom: 24px;
      }

      .price-row {
        display: flex;
        align-items: baseline;
        gap: 16px;
        margin-bottom: 20px;
      }

      .price {
        font-size: 32px;
        font-weight: 800;
        color: #ff6b6b;
      }

      .subtotal {
        font-size: 16px;
        color: #666;
      }

      .qty-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
      }

      .qty-label {
        font-weight: 600;
        color: #333;
      }

      .stepper {
        display: flex;
        align-items: center;
        gap: 0;
        border: 2px solid #eee;
        border-radius: 8px;
        overflow: hidden;
      }

      .step-btn {
        width: 36px;
        height: 36px;
        border: none;
        background: #f9f9f9;
        font-size: 20px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover:not(:disabled) {
          background: #ff6b6b;
          color: white;
        }
        &:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }
      }

      .qty-value {
        min-width: 44px;
        text-align: center;
        font-size: 16px;
        font-weight: 700;
        color: #333;
      }

      .success-msg {
        margin-top: 16px;
        padding: 12px 16px;
        background: #e8f5e9;
        color: #2e7d32;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        animation: fadeIn 0.3s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  protected svc = inject(ProductService);
  private route = inject(ActivatedRoute);

  private idParam = toSignal(this.route.paramMap.pipe(map((p) => Number(p.get('id')))), {
    initialValue: 0,
  });

  protected product = computed(() => this.svc.getProductById(this.idParam()));

  protected orderQty = signal(1);

  protected ordered = signal(false);
  protected lastOrderQty = signal(0);

  protected canBuy = computed(() => {
    const p = this.product();
    return !!p && p.quantity > 0 && this.orderQty() <= p.quantity;
  });

  protected buyLabel = computed(() => {
    const p = this.product();
    if (!p || p.quantity <= 0) return 'Out of Stock';
    return `Add to Cart (${this.orderQty()})`;
  });

  protected stockClass = computed(() => {
    const q = this.product()?.quantity ?? 0;
    if (q <= 0) return 'stock-info stock-none';
    if (q === 1) return 'stock-info stock-last';
    return 'stock-info stock-ok';
  });

  increment(): void {
    const max = this.product()?.quantity ?? 1;
    this.orderQty.update((q) => Math.min(q + 1, max));
  }

  decrement(): void {
    this.orderQty.update((q) => Math.max(q - 1, 1));
  }

  handleOrder(): void {
    const p = this.product();
    if (!p || !this.canBuy()) return;

    const qty = this.orderQty();
    this.svc.orderProduct(p.id, qty);

    this.lastOrderQty.set(qty);
    this.ordered.set(true);
    this.orderQty.set(1);
    setTimeout(() => this.ordered.set(false), 3000);
  }
}
