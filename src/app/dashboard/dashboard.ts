import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dash-page">
      <header class="dash-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p class="subtitle">{{ svc.products().length }} products total</p>
        </div>
        <button class="btn-add" (click)="openAdd()">+ Add Product</button>
      </header>

      @if (svc.loading()) {
        <div class="loading">Loading products…</div>
      } @else if (svc.error()) {
        <div class="error-banner">{{ svc.error() }}</div>
      } @else {
        <div class="table-wrap">
          <table class="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (p of svc.products(); track p.id) {
                <tr>
                  <td><img [src]="p.image" [alt]="p.title" class="thumb" /></td>
                  <td class="title-cell">{{ p.title }}</td>
                  <td>
                    <span class="tag">{{ p.category }}</span>
                  </td>
                  <td class="price">{{ p.price | currency }}</td>
                  <td>
                    <span [class]="stockClass(p.quantity)">{{ p.quantity }}</span>
                  </td>
                  <td>★ {{ p.rating.rate }} ({{ p.rating.count }})</td>
                  <td class="actions">
                    <button class="btn-edit" (click)="openEdit(p)">Edit</button>
                    <button class="btn-del" (click)="confirmDelete(p)">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h2>{{ editingId() ? 'Edit Product' : 'Add Product' }}</h2>

            <form [formGroup]="form" (ngSubmit)="submitForm()" novalidate>
              <div class="field">
                <label>Title *</label>
                <input formControlName="title" placeholder="Product name" />
                @if (f['title'].invalid && f['title'].touched) {
                  <span class="err">Title is required (min 3 chars).</span>
                }
              </div>

              <div class="row-2">
                <div class="field">
                  <label>Price ($) *</label>
                  <input type="number" formControlName="price" step="0.01" />
                  @if (f['price'].invalid && f['price'].touched) {
                    <span class="err">Price > 0 required.</span>
                  }
                </div>
                <div class="field">
                  <label>Quantity *</label>
                  <input type="number" formControlName="quantity" />
                  @if (f['quantity'].invalid && f['quantity'].touched) {
                    <span class="err">Quantity ≥ 0 required.</span>
                  }
                </div>
              </div>

              <div class="field">
                <label>Category *</label>
                <input formControlName="category" placeholder="e.g. electronics" />
                @if (f['category'].invalid && f['category'].touched) {
                  <span class="err">Category required.</span>
                }
              </div>

              <div class="field">
                <label>Image URL *</label>
                <input type="url" formControlName="image" placeholder="https://..." />
                @if (form.value.image && f['image'].valid) {
                  <img [src]="form.value.image" class="img-preview" alt="preview" />
                }
              </div>

              <div class="field">
                <label>Description *</label>
                <textarea formControlName="description" rows="3"></textarea>
                @if (f['description'].invalid && f['description'].touched) {
                  <span class="err">Description required.</span>
                }
              </div>

              <div class="modal-footer">
                <button type="button" class="btn-cancel" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn-save">
                  {{ editingId() ? 'Save Changes' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (deleteTarget()) {
        <div class="modal-overlay" (click)="deleteTarget.set(null)">
          <div class="modal confirm" (click)="$event.stopPropagation()">
            <h2>Delete Product?</h2>
            <p>
              Are you sure you want to delete <strong>{{ deleteTarget()!.title }}</strong
              >?
            </p>
            <div class="modal-footer">
              <button class="btn-cancel" (click)="deleteTarget.set(null)">Cancel</button>
              <button class="btn-del" (click)="executeDelete()">Confirm Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .dash-page {
        padding: 32px 24px;
        max-width: 1280px;
        margin: 0 auto;
      }
      .dash-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }
      .dash-header h1 {
        margin: 0;
        font-size: 26px;
      }
      .subtitle {
        color: #888;
        font-size: 14px;
        margin: 4px 0 0;
      }
      .btn-add {
        padding: 10px 20px;
        background: #6c63ff;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
      }
      .btn-add:hover {
        background: #574fd6;
      }
      .loading,
      .error-banner {
        padding: 40px;
        text-align: center;
        color: #888;
      }
      .error-banner {
        color: #c62828;
        background: #fdecea;
        border-radius: 8px;
      }

      .table-wrap {
        overflow-x: auto;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      }
      .product-table {
        width: 100%;
        border-collapse: collapse;
        background: var(--card-bg, white);
      }
      .product-table th {
        background: var(--table-head, #f5f5f5);
        padding: 12px 16px;
        text-align: left;
        font-size: 13px;
        color: #555;
      }
      .product-table td {
        padding: 12px 16px;
        border-top: 1px solid var(--border, #f0f0f0);
        vertical-align: middle;
      }
      .thumb {
        width: 48px;
        height: 48px;
        object-fit: contain;
        border-radius: 6px;
      }
      .title-cell {
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 600;
      }
      .tag {
        background: #ede7f6;
        color: #5e35b1;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
      }
      .price {
        font-weight: 700;
        color: #6c63ff;
      }
      .stock-ok {
        color: #2e7d32;
        font-weight: 700;
      }
      .stock-low {
        color: #f57c00;
        font-weight: 700;
      }
      .stock-out {
        color: #c62828;
        font-weight: 700;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .btn-edit {
        padding: 6px 14px;
        background: #e8f5e9;
        color: #2e7d32;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      }
      .btn-del {
        padding: 6px 14px;
        background: #fdecea;
        color: #c62828;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      }

      /* Modal */
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 200;
      }
      .modal {
        background: var(--card-bg, white);
        color: var(--text, #111);
        border-radius: 16px;
        padding: 32px;
        width: 100%;
        max-width: 520px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
      }
      .modal h2 {
        margin: 0 0 20px;
        font-size: 20px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
      }
      .field label {
        font-size: 13px;
        font-weight: 600;
      }
      .field input,
      .field textarea {
        padding: 9px 12px;
        border: 1.5px solid var(--border, #e0e0e0);
        border-radius: 8px;
        font-size: 14px;
        background: var(--input-bg, white);
        color: var(--text, #111);
      }
      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .err {
        font-size: 12px;
        color: #c62828;
      }
      .img-preview {
        width: 80px;
        height: 80px;
        object-fit: contain;
        margin-top: 6px;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
      }
      .btn-cancel {
        padding: 10px 20px;
        background: #f5f5f5;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      }
      .btn-save {
        padding: 10px 20px;
        background: #6c63ff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 700;
      }
      .confirm p {
        color: #555;
        margin: 0 0 20px;
      }
    `,
  ],
})
export class DashboardComponent {
  svc = inject(ProductService);

  showModal = signal(false);
  editingId = signal<number | null>(null);
  deleteTarget = signal<Product | null>(null);

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    category: new FormControl('', Validators.required),
    image: new FormControl('', [Validators.required, Validators.pattern('https?://.+')]),
    description: new FormControl('', Validators.required),
  });

  get f() {
    return this.form.controls;
  }

  stockClass(qty: number): string {
    if (qty <= 0) return 'stock-out';
    if (qty <= 2) return 'stock-low';
    return 'stock-ok';
  }

  openAdd(): void {
    this.editingId.set(null);
    this.form.reset();
    this.showModal.set(true);
  }

  openEdit(p: Product): void {
    this.editingId.set(p.id);
    this.form.patchValue({
      title: p.title,
      price: p.price,
      quantity: p.quantity,
      category: p.category,
      image: p.image,
      description: p.description,
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.form.reset();
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value as any;
    const id = this.editingId();

    if (id !== null) {
      // PUT — update existing
      this.svc.updateProduct(id, {
        title: val.title,
        price: val.price,
        quantity: val.quantity,
        category: val.category,
        image: val.image,
        description: val.description,
      });
    } else {
      // POST — create new
      this.svc.addProduct({
        title: val.title,
        price: val.price,
        quantity: val.quantity,
        category: val.category,
        image: val.image,
        description: val.description,
      });
    }
    this.closeModal();
  }

  confirmDelete(p: Product): void {
    this.deleteTarget.set(p);
  }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (target) {
      this.svc.deleteProduct(target.id);
      this.deleteTarget.set(null);
    }
  }
}
