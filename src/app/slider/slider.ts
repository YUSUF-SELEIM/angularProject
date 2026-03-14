import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface SliderProduct {
  id: string;
  title: string;
  price: number;
  discountPrice: number | null;
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
    private http: HttpClient,
  ) {}

  ngOnInit() {
    console.log('Slider initialized');
    this.fetchSliderProducts();
  }

  private fetchSliderProducts(): void {
    this.http.get<any>('http://localhost:3000/api/products?page=1&limit=10').subscribe({
      next: (res) => {
        const rawList = this.extractProducts(res);
        const data: SliderProduct[] = rawList.map((p: any) => this.normalizeSliderProduct(p));
        this.products.set(data);
        if (data.length > 0) {
          this.startAutoSlide();
        }
      },
      error: (error) => {
        console.error('Error fetching slider products:', error);
      },
    });
  }

  private extractProducts(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.products)) return res.products;
    if (Array.isArray(res?.data?.products)) return res.data.products;
    return [];
  }

  private normalizeSliderProduct(raw: any): SliderProduct {
    const ratingValue =
      typeof raw?.rating === 'number'
        ? raw.rating
        : Number(raw?.rating?.rate ?? raw?.averageRating ?? 0);

    const firstImage = this.resolveImage(raw);
    const category =
      typeof raw?.category === 'string'
        ? raw.category
        : (raw?.category?.name ?? raw?.category?._id ?? 'general');

    return {
      id: String(raw?._id ?? raw?.id ?? crypto.randomUUID()),
      title: String(raw?.title ?? 'Product'),
      price: Number(raw?.price ?? 0),
      discountPrice:
        raw?.discountPrice === null || raw?.discountPrice === undefined
          ? null
          : Number(raw.discountPrice),
      description: String(raw?.description ?? ''),
      category,
      image: String(firstImage),
      rating: {
        rate: Number(ratingValue),
        count: Number(raw?.ratingCount ?? raw?.reviewsCount ?? raw?.reviewCount ?? 0),
      },
    };
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

  private resolveImage(raw: any): string {
    if (Array.isArray(raw?.photos) && raw.photos.length > 0) {
      const photo = String(raw.photos[0]);
      if (!/\/uploads\/https?:/.test(photo)) {
        return photo;
      }
    }

    if (Array.isArray(raw?.images) && raw.images.length > 0) {
      const img = String(raw.images[0] ?? '');
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return img;
      }
      return img ? `http://localhost:3000/uploads/${img}` : '';
    }

    return String(raw?.imageURL ?? raw?.image ?? raw?.thumbnail ?? '');
  }
}
