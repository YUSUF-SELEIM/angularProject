import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slider } from '../slider/slider';
import { CardComponent } from '../card/card';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Slider, CardComponent],
  template: `
    <div class="container">
      <section class="slider-section">
        <app-slider />
      </section>

      <section class="cards-section">
        <h2>Featured Products</h2>

        @if (svc.loading()) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Loading products…</p>
          </div>
        } @else if (svc.products().length === 0) {
          <p class="empty">No products found.</p>
        } @else {
          <div class="cards-grid">
            @for (product of svc.products(); track product.id) {
              <app-card [product]="product" />
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
      }

      .container {
        width: 100%;
        max-width: 1280px;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
      }

      .slider-section {
        width: 100%;
        padding: 40px 20px;
        display: flex;
        justify-content: center;
      }

      app-slider {
        display: block;
        width: 100%;
        max-width: 1200px;
      }

      .cards-section {
        width: 100%;
        padding: 40px 20px;
        background: #f9f9f9;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      h2 {
        text-align: center;
        color: #2c3e50;
        margin: 0 0 30px 0;
        font-size: 28px;
      }

      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px;
        color: #666;
        font-size: 18px;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #eee;
        border-top-color: #ff6b6b;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .empty {
        text-align: center;
        padding: 40px;
        color: #999;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        max-width: 1200px;
        width: 100%;
      }
    `,
  ],
})
export class HomeComponent {
  protected svc = inject(ProductService);
}
