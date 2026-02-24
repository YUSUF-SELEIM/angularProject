import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button';
import { ShadowDirective } from '../directives/shadow.directive';
import { ZoomDirective } from '../directives/zoom.directive';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ShadowDirective, ZoomDirective],
  template: `
    <div class="card" appShadow>
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
        <p class="card-description" [class.expanded]="isExpanded()" (click)="toggleDescription()">
          {{ isExpanded() ? product().description : truncateText(product().description) }}
        </p>
        <div class="card-footer">
          <span class="card-price">\${{ product().price }}</span>
          <app-button [title]="'Buy'" [color]="'#FF6B6B'" (onClick)="onBuy.emit(product().id)" />
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
        transition: all 0.3s ease;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  product = input.required<Product>();
  onBuy = output<number>();

  private isDescriptionExpanded = signal(false);

  isExpanded(): boolean {
    return this.isDescriptionExpanded();
  }

  toggleDescription(): void {
    this.isDescriptionExpanded.update((value) => !value);
  }

  truncateText(text: string, limit: number = 100): string {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  }
}
