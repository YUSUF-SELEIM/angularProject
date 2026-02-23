import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../product';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.html',
})
export class Slider implements OnInit, OnDestroy {
  products: any[] = [];
  currentIndex = 0;
  private intervalId: any;

  constructor(
    private p: Product,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log('Slider initialized');
    this.p.getProducts().subscribe((data) => {
      this.products = data;

      if (this.products.length > 0) {
        this.startAutoSlide();
      }
    });
  }

  startAutoSlide() {
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => {
          if (this.products.length > 0) {
            this.currentIndex = (this.currentIndex + 1) % this.products.length;
            this.cdr.detectChanges();
          }
        });
      }, 3000);
    });
  }

  goTo(index: number) {
    this.currentIndex = index;
    this.resetAutoSlide();
  }

  next() {
    if (this.products.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.products.length;
      this.resetAutoSlide();
    }
  }

  previous() {
    if (this.products.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.products.length) % this.products.length;
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
