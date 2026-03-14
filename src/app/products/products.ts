import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../services/product.service';
import { ElvoraApiService } from '../services/elvora-api.service';
import { CardComponent } from '../card/card';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>All Products</h1>
          <p class="subtitle">
            {{ filteredProducts().length }} result{{ filteredProducts().length === 1 ? '' : 's' }}
          </p>
        </div>
        <button class="btn-clear" (click)="clearFilters()" [class.visible]="hasActiveFilters()">
          ✕ Clear filters
        </button>
      </div>

      <div class="layout">
        <!-- Sidebar filters -->
        <aside class="sidebar">
          <h2>Filters</h2>

          <!-- Search -->
          <div class="filter-group">
            <label class="filter-label">Search</label>
            <div class="search-wrap">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                class="search-input"
                placeholder="Search products…"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
              />
              @if (searchQuery()) {
                <button class="clear-input" (click)="searchQuery.set('')">✕</button>
              }
            </div>
          </div>

          <!-- Category -->
          <div class="filter-group">
            <label class="filter-label">Category</label>
            @if (categoriesLoading()) {
              <p class="loading-cat">Loading…</p>
            } @else {
              <div class="category-list">
                <button
                  class="cat-btn"
                  [class.active]="selectedCategory() === ''"
                  (click)="selectedCategory.set('')"
                >
                  All
                </button>
                @for (cat of categories(); track cat.id) {
                  <button
                    class="cat-btn"
                    [class.active]="selectedCategory() === cat.id"
                    (click)="selectedCategory.set(cat.id)"
                  >
                    {{ cat.name }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Price range -->
          <div class="filter-group">
            <label class="filter-label">
              Price range
              <span class="price-hint">\${{ minPrice() }} – \${{ maxPrice() }}</span>
            </label>
            <div class="range-row">
              <input
                type="number"
                class="price-input"
                placeholder="Min"
                [ngModel]="minPrice()"
                (ngModelChange)="minPrice.set($event === '' ? '' : +$event)"
                min="0"
              />
              <span class="range-sep">–</span>
              <input
                type="number"
                class="price-input"
                placeholder="Max"
                [ngModel]="maxPrice()"
                (ngModelChange)="maxPrice.set($event === '' ? '' : +$event)"
                min="0"
              />
            </div>
          </div>

          <!-- In stock toggle -->
          <div class="filter-group">
            <label class="toggle-row">
              <span class="filter-label" style="margin:0">In Stock Only</span>
              <span
                class="toggle"
                [class.on]="inStockOnly()"
                (click)="inStockOnly.set(!inStockOnly())"
                role="switch"
                [attr.aria-checked]="inStockOnly()"
              ></span>
            </label>
          </div>

          <!-- Sort -->
          <div class="filter-group">
            <label class="filter-label">Sort by</label>
            <select class="sort-select" [ngModel]="sortKey()" (ngModelChange)="sortKey.set($event)">
              <option value="">Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
              <option value="rating-desc">Top Rated</option>
            </select>
          </div>
        </aside>

        <!-- Product grid -->
        <section class="grid-section">
          @if (svc.loading()) {
            <div class="state-box">
              <div class="spinner"></div>
              <p>Loading products…</p>
            </div>
          } @else if (svc.error()) {
            <div class="state-box error">
              <p>{{ svc.error() }}</p>
              <button (click)="svc.fetchProducts()">Retry</button>
            </div>
          } @else if (filteredProducts().length === 0) {
            <div class="state-box">
              <p class="empty-msg">No products match your filters.</p>
              <button class="btn-reset" (click)="clearFilters()">Clear filters</button>
            </div>
          } @else {
            <div class="cards-grid">
              @for (product of filteredProducts(); track product.id) {
                <app-card [product]="product" />
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1280px;
        margin: 0 auto;
        padding: 28px 20px;
      }

      /* Header */
      .page-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 28px;
        flex-wrap: wrap;
        gap: 10px;
      }
      .page-header h1 {
        margin: 0 0 4px;
        font-size: 28px;
        font-weight: 800;
        color: var(--color, #111);
      }
      .subtitle {
        margin: 0;
        color: #888;
        font-size: 14px;
      }
      .btn-clear {
        display: none;
        padding: 8px 16px;
        border: 1.5px solid #ff6b6b;
        border-radius: 20px;
        color: #ff6b6b;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        background: transparent;
        transition: all 0.2s;

        &:hover {
          background: #ff6b6b;
          color: white;
        }

        &.visible {
          display: inline-block;
        }
      }

      /* Two-column layout */
      .layout {
        display: grid;
        grid-template-columns: 240px 1fr;
        gap: 28px;
        align-items: start;
      }

      @media (max-width: 800px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }

      /* Sidebar */
      .sidebar {
        background: var(--card-bg, white);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
        position: sticky;
        top: 76px;
      }
      .sidebar h2 {
        margin: 0 0 18px;
        font-size: 16px;
        font-weight: 700;
        color: var(--color, #111);
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .filter-group {
        margin-bottom: 22px;
      }
      .filter-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #888;
        margin-bottom: 10px;
      }
      .price-hint {
        font-size: 11px;
        color: #aaa;
        font-weight: 400;
        text-transform: none;
      }

      /* Search */
      .search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-icon {
        position: absolute;
        left: 10px;
        font-size: 14px;
        pointer-events: none;
      }
      .search-input {
        width: 100%;
        padding: 9px 32px 9px 32px;
        border: 1.5px solid var(--border, #e0e0e0);
        border-radius: 8px;
        font-size: 14px;
        background: var(--input-bg, white);
        color: var(--color, #111);
        box-sizing: border-box;
        transition: border-color 0.2s;

        &:focus {
          outline: none;
          border-color: #ff6b6b;
        }
      }
      .clear-input {
        position: absolute;
        right: 8px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 12px;
        color: #aaa;
        padding: 2px 4px;

        &:hover {
          color: #666;
        }
      }

      /* Categories */
      .loading-cat {
        font-size: 13px;
        color: #aaa;
        margin: 0;
      }
      .category-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .cat-btn {
        padding: 5px 12px;
        border: 1.5px solid var(--border, #e0e0e0);
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        background: transparent;
        color: var(--color, #555);
        transition: all 0.18s;

        &:hover {
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        &.active {
          background: #ff6b6b;
          border-color: #ff6b6b;
          color: white;
        }
      }

      /* Price range */
      .range-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .price-input {
        flex: 1;
        padding: 8px 10px;
        border: 1.5px solid var(--border, #e0e0e0);
        border-radius: 8px;
        font-size: 13px;
        background: var(--input-bg, white);
        color: var(--color, #111);
        min-width: 0;

        &:focus {
          outline: none;
          border-color: #ff6b6b;
        }
      }
      .range-sep {
        color: #aaa;
        font-size: 14px;
        flex-shrink: 0;
      }

      /* Toggle */
      .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
      }
      .toggle {
        width: 40px;
        height: 22px;
        border-radius: 11px;
        background: #ddd;
        position: relative;
        transition: background 0.2s;
        flex-shrink: 0;

        &::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          top: 3px;
          left: 3px;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        &.on {
          background: #ff6b6b;

          &::after {
            transform: translateX(18px);
          }
        }
      }

      /* Sort */
      .sort-select {
        width: 100%;
        padding: 8px 10px;
        border: 1.5px solid var(--border, #e0e0e0);
        border-radius: 8px;
        font-size: 14px;
        background: var(--input-bg, white);
        color: var(--color, #111);
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: #ff6b6b;
        }
      }

      /* Grid */
      .grid-section {
        min-height: 300px;
      }
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 22px;
      }

      /* State boxes */
      .state-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 80px 20px;
        color: var(--color, #666);
        font-size: 16px;
        text-align: center;
      }
      .state-box.error {
        color: #c62828;
      }
      .empty-msg {
        color: #888;
        margin: 0;
      }
      .btn-reset {
        padding: 10px 22px;
        border: none;
        border-radius: 20px;
        background: #ff6b6b;
        color: white;
        font-weight: 700;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;

        &:hover {
          background: #ff5252;
        }
      }
      .spinner {
        width: 44px;
        height: 44px;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent implements OnInit {
  protected svc = inject(ProductService);
  private api = inject(ElvoraApiService);

  // Filter state — must be signals so computed() tracks them
  searchQuery = signal('');
  selectedCategory = signal('');
  minPrice = signal<number | ''>('');
  maxPrice = signal<number | ''>('');
  inStockOnly = signal(false);
  sortKey = signal('');

  categories = signal<CategoryOption[]>([]);
  categoriesLoading = signal(true);

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res: any) => {
        const candidates = [res?.data?.categories, res?.data, res?.categories, res].find((x) =>
          Array.isArray(x),
        );
        const raw = Array.isArray(candidates) ? candidates : [];
        this.categories.set(
          raw
            .map((item: any) => ({
              id: String(item?._id ?? item?.id ?? ''),
              name: String(item?.name ?? item?.title ?? '').trim(),
              slug: String(item?.slug ?? '').trim(),
            }))
            .filter((c: CategoryOption) => c.id.length > 0),
        );
        this.categoriesLoading.set(false);
      },
      error: () => this.categoriesLoading.set(false),
    });
  }

  hasActiveFilters = computed(
    () =>
      this.searchQuery().trim().length > 0 ||
      this.selectedCategory() !== '' ||
      this.minPrice() !== '' ||
      this.maxPrice() !== '' ||
      this.inStockOnly() ||
      this.sortKey() !== '',
  );

  filteredProducts = computed<Product[]>(() => {
    let list = this.svc.products();

    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (this.selectedCategory()) {
      list = list.filter((p) => p.categoryId === this.selectedCategory());
    }

    if (this.minPrice() !== '' && !isNaN(Number(this.minPrice()))) {
      list = list.filter((p) => p.price >= Number(this.minPrice()));
    }

    if (this.maxPrice() !== '' && !isNaN(Number(this.maxPrice()))) {
      list = list.filter((p) => p.price <= Number(this.maxPrice()));
    }

    if (this.inStockOnly()) {
      list = list.filter((p) => p.quantity > 0);
    }

    switch (this.sortKey()) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'rating-desc':
        list = [...list].sort((a, b) => b.rating.rate - a.rating.rate);
        break;
    }

    return list;
  });

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.minPrice.set('');
    this.maxPrice.set('');
    this.inStockOnly.set(false);
    this.sortKey.set('');
  }
}
