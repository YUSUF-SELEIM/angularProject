import { Component, input, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShadowDirective } from '../directives/shadow.directive';
import { ZoomDirective } from '../directives/zoom.directive';
export type { Product } from '../services/product.service';
import type { Product } from '../services/product.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ShadowDirective, ZoomDirective],
  template: `
    <div class="card" appShadow [routerLink]="['/products', product().id]">
      <span class="stock-badge" [class]="stockBadgeClass()">
        {{ stockLabel() }}
      </span>

      <div class="card-image-wrapper">
        <img [src]="product().image" [alt]="product().title" class="card-image" appZoom />
      </div>

      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">{{ product().title }}</h3>
          <div class="card-rating">
            <span class="rating-stars">★</span>
            <span class="rating-value">{{ product().rating.rate }}</span>
            <span class="rating-count">({{ product().rating.count }})</span>
          </div>
        </div>

        <p class="card-category">{{ product().category }}</p>

        <p
          class="card-description"
          [class.expanded]="isExpanded()"
          (click)="toggleDescription(); $event.stopPropagation()"
        >
          {{ isExpanded() ? product().description : truncateText(product().description) }}
        </p>

        <div class="card-footer">
          <span class="card-price">\${{ product().price }}</span>
          <span class="view-link">View details →</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        height: 100%;
        cursor: pointer;
        position: relative;
      }

      .stock-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        z-index: 2;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .badge-in-stock {
        background: #e8f5e9;
        color: #2e7d32;
      }
      .badge-last-item {
        background: #fff3e0;
        color: #e65100;
      }
      .badge-out {
        background: #ffebee;
        color: #c62828;
      }

      .card-image-wrapper {
        width: 100%;
        height: 250px;
        overflow: hidden;
        background: #f5f5f5;
      }

      .card-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .card-content {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .card-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: #333;
        flex: 1;
        padding-right: 8px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }

      .card-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        white-space: nowrap;
      }

      .rating-stars {
        color: #ffc107;
        font-size: 14px;
      }
      .rating-value {
        font-weight: 600;
        color: #333;
      }
      .rating-count {
        color: #999;
      }

      .card-category {
        font-size: 12px;
        color: #999;
        text-transform: capitalize;
        margin: 0 0 8px 0;
      }

      .card-description {
        font-size: 14px;
        color: #666;
        margin: 0 0 12px 0;
        flex: 1;
        cursor: pointer;
        transition: color 0.3s ease;
        word-break: break-word;

        &:hover {
          color: #333;
        }
        &.expanded {
          color: #2c3e50;
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
      }

      .card-price {
        font-size: 18px;
        font-weight: 700;
        color: #2c3e50;
      }

      .view-link {
        font-size: 13px;
        color: #ff6b6b;
        font-weight: 600;
        transition: letter-spacing 0.2s;
      }

      .card:hover .view-link {
        letter-spacing: 0.5px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  product = input.required<Product>();

  private _isExpanded = signal(false);
  isExpanded = this._isExpanded.asReadonly();

  stockBadgeClass(): string {
    const q = this.product().quantity;
    if (q <= 0) return 'stock-badge badge-out';
    if (q === 1) return 'stock-badge badge-last-item';
    return 'stock-badge badge-in-stock';
  }

  stockLabel(): string {
    const q = this.product().quantity;
    if (q <= 0) return 'Out of Stock';
    if (q === 1) return 'Last Item!';
    return `${q} in stock`;
  }

  toggleDescription(): void {
    this._isExpanded.update((v) => !v);
  }

  truncateText(text: string, limit = 80): string {
    if (!text || text.length <= limit) return text ?? '';
    return text.substring(0, limit) + '…';
  }
}
