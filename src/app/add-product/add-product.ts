import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { ElvoraApiService } from '../services/elvora-api.service';

interface CategoryOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page">
      <a class="back-link" routerLink="/">← Back to Products</a>
      <h1>Add New Product</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="form-card" novalidate>
        <div class="field">
          <label for="title">Product Title *</label>

          <input
            id="title"
            type="text"
            formControlName="title"
            placeholder="e.g. Wireless Headphones"
          />
          @if (f['title'].invalid && f['title'].touched) {
            <span class="error">
              @if (f['title'].errors?.['required']) {
                Title is required.
              } @else if (f['title'].errors?.['minlength']) {
                At least 3 characters.
              }
            </span>
          }
        </div>

        <div class="field">
          <label for="price">Price ($) *</label>
          <input id="price" type="number" formControlName="price" placeholder="0.00" step="0.01" />
          @if (f['price'].invalid && f['price'].touched) {
            <span class="error">
              @if (f['price'].errors?.['required']) {
                Price is required.
              } @else if (f['price'].errors?.['min']) {
                Price must be greater than 0.
              }
            </span>
          }
        </div>

        <div class="field">
          <label for="quantity">Initial Stock Quantity *</label>
          <input id="quantity" type="number" formControlName="quantity" placeholder="10" />
          @if (f['quantity'].invalid && f['quantity'].touched) {
            <span class="error">
              @if (f['quantity'].errors?.['required']) {
                Quantity is required.
              } @else if (f['quantity'].errors?.['min']) {
                Must be at least 1.
              }
            </span>
          }
        </div>

        <div class="field">
          <label for="category">Category *</label>
          <select id="category" formControlName="category">
            <option value="" disabled>Select category</option>
            @for (c of categories(); track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
          @if (f['category'].invalid && f['category'].touched) {
            <span class="error">Category is required.</span>
          }
          @if (categoriesError()) {
            <span class="error">{{ categoriesError() }}</span>
          }
        </div>

        <div class="field">
          <label for="image">Image URL *</label>
          <input id="image" type="url" formControlName="image" placeholder="https://..." />
          @if (f['image'].invalid && f['image'].touched) {
            <span class="error">A valid image URL is required.</span>
          }
          @if (f['image'].value && f['image'].valid) {
            <img [src]="f['image'].value" alt="preview" class="img-preview" />
          }
        </div>

        <div class="field">
          <label for="description">Description *</label>
          <textarea
            id="description"
            formControlName="description"
            rows="4"
            placeholder="Describe the product…"
          ></textarea>
          @if (f['description'].invalid && f['description'].touched) {
            <span class="error">Description is required.</span>
          }
        </div>

        <div class="actions">
          <button type="submit" class="btn-submit" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Saving...' : 'Add Product' }}
          </button>
          <a routerLink="/" class="btn-cancel">Cancel</a>
        </div>

        @if (submitError()) {
          <p class="submit-error">{{ submitError() }}</p>
        }
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 640px;
        margin: 0 auto;
        padding: 24px 20px;
      }

      .back-link {
        display: inline-block;
        margin-bottom: 20px;
        color: #ff6b6b;
        font-weight: 600;
        text-decoration: none;
        font-size: 15px;
        transition: letter-spacing 0.2s;

        &:hover {
          letter-spacing: 0.5px;
        }
      }

      h1 {
        font-size: 26px;
        font-weight: 700;
        color: #2c3e50;
        margin: 0 0 28px;
      }

      .form-card {
        background: white;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      label {
        font-size: 14px;
        font-weight: 600;
        color: #444;
      }

      input,
      select,
      textarea {
        padding: 10px 14px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 15px;
        transition: border-color 0.2s;
        font-family: inherit;
        resize: vertical;

        &:focus {
          outline: none;
          border-color: #ff6b6b;
        }
      }

      /* Red border when invalid and touched */
      input.ng-invalid.ng-touched,
      select.ng-invalid.ng-touched,
      textarea.ng-invalid.ng-touched {
        border-color: #e53935;
      }

      .error {
        font-size: 12px;
        color: #e53935;
        font-weight: 500;
      }

      .img-preview {
        max-height: 120px;
        object-fit: contain;
        border-radius: 8px;
        border: 1px solid #eee;
        margin-top: 4px;
        align-self: flex-start;
      }

      .actions {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-top: 8px;
      }

      .btn-submit {
        padding: 12px 28px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: #ff5252;
          transform: translateY(-1px);
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }

      .btn-cancel {
        padding: 12px 20px;
        color: #666;
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
        border-radius: 8px;
        transition: background 0.2s;

        &:hover {
          background: #f5f5f5;
        }
      }

      .submit-error {
        margin: 0;
        color: #c62828;
        font-size: 13px;
        font-weight: 600;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductComponent {
  private svc = inject(ProductService);
  private api = inject(ElvoraApiService);
  private router = inject(Router);

  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  categories = signal<CategoryOption[]>([]);
  categoriesError = signal<string | null>(null);

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    quantity: new FormControl<number | null>(10, [Validators.required, Validators.min(1)]),
    category: new FormControl('', Validators.required),
    image: new FormControl('', [Validators.required, Validators.pattern('https?://.+')]),
    description: new FormControl('', Validators.required),
  });

  get f() {
    return this.form.controls;
  }

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoriesError.set(null);
    this.api.getCategories().subscribe({
      next: (res: any) => {
        const list = this.extractCategories(res);
        this.categories.set(list);
        if (list.length === 0) {
          this.categoriesError.set('No categories found. Please create categories first.');
        }
      },
      error: () => {
        this.categories.set([]);
        this.categoriesError.set('Could not load categories.');
      },
    });
  }

  private extractCategories(res: any): CategoryOption[] {
    const candidates = [res?.data?.categories, res?.data, res?.categories, res].find((x) =>
      Array.isArray(x),
    );
    const raw = Array.isArray(candidates) ? candidates : [];

    return raw
      .map((item: any) => ({
        id: String(item?._id ?? item?.id ?? ''),
        name: String(item?.name ?? item?.title ?? '').trim(),
      }))
      .filter((item: CategoryOption) => item.id.length > 0 && item.name.length > 0);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    this.submitError.set(null);
    this.isSubmitting.set(true);

    this.svc
      .addProduct({
        title: v.title!,
        price: v.price!,
        quantity: v.quantity!,
        category: v.category!,
        image: v.image!,
        description: v.description!,
      })
      .subscribe((result) => {
        this.isSubmitting.set(false);

        if (result.ok) {
          this.router.navigate(['/dashboard']);
          return;
        }

        this.submitError.set(result.message ?? 'Could not add product.');
      });
  }
}
