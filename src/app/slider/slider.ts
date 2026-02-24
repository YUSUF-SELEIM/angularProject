import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SliderProduct {
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
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.html',
  styleUrls: ['./slider.css'],
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class Slider implements OnInit, OnDestroy {
  products = signal<SliderProduct[]>([]);
  currentIndex = signal(0);
  private intervalId: any;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log('Slider initialized');
    this.fetchSliderProducts();
  }

  private fetchSliderProducts(): void {
    fetch('https://fakestoreapi.com/products?limit=10')
      .then((response) => response.json())
      .then((data: SliderProduct[]) => {
        this.products.set(data);
        if (data.length > 0) {
          this.startAutoSlide();
        }
      })
      .catch((error) => {
        console.error('Error fetching slider products:', error);
      });
  }

  startAutoSlide() {
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => {
          const productsLength = this.products().length;
          if (productsLength > 0) {
            const nextIndex = (this.currentIndex() + 1) % productsLength;
            this.currentIndex.set(nextIndex);
          }
        });
      }, 3000);
    });
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    this.resetAutoSlide();
  }

  next() {
    const productsLength = this.products().length;
    if (productsLength > 0) {
      const nextIndex = (this.currentIndex() + 1) % productsLength;
      this.currentIndex.set(nextIndex);
      this.resetAutoSlide();
    }
  }

  previous() {
    const productsLength = this.products().length;
    if (productsLength > 0) {
      const prevIndex = (this.currentIndex() - 1 + productsLength) % productsLength;
      this.currentIndex.set(prevIndex);
      this.resetAutoSlide();
    }
  }

  resetAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
