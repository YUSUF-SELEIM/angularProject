import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../product';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.html',
})
export class Slider implements OnInit {
  products: any[] = [];
  currentIndex = 0;

  constructor(private Product: Product) {}

  intervalId: any;

  ngOnInit() {
    this.Product.getProducts().subscribe((data) => {
      this.products = data;
      this.startAutoSlide();
    });
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      if (this.products.length > 0) {
        this.currentIndex = (this.currentIndex + 1) % this.products.length;
      }
    }, 1000);
  }

  goTo(index: number) {
    this.currentIndex = index;
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
