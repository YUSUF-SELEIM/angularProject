import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Slider } from './slider/slider';
import { CardComponent, type Product } from './card/card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Slider, CardComponent],
  template: `
    <div class="container">
      <section class="slider-section">
        <app-slider></app-slider>
      </section>

      <section class="cards-section">
        <h2>Featured Products</h2>
        @if (loading()) {
          <div class="loading">Loading products...</div>
        } @else {
          <div class="cards-grid">
            @for (product of products(); track product.id) {
              <app-card [product]="product" (onBuy)="handleBuyProduct($event)" />
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .container {
        width: 100%;
        display: flex;
        flex-direction: column;
      }

      .slider-section {
        width: 100%;
        padding: 40px 20px;
        display: flex;
        justify-content: center;
        align-items: center;
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
        text-align: center;
        padding: 40px;
        font-size: 18px;
        color: #666;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
      }

      @media (min-width: 768px) {
        .cards-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
    `,
  ],
})
export class App {
  protected readonly title = signal('angularProject');
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    effect(() => {
      this.fetchProducts();
    });
  }

  private fetchProducts(): void {
    fetch('https://fakestoreapi.com/products?limit=10')
      .then((response) => response.json())
      .then((data: Product[]) => {
        this.products.set(data);
        this.loading.set(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        this.loading.set(false);
      });
  }

  handleBuyProduct(productId: number): void {
    console.log('Buy product:', productId);
    alert(`Added product ${productId} to cart!`);
  }
}
