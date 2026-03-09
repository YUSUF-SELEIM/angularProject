import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ElvoraApiService } from '../services/elvora-api.service';

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

interface OrderModel {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  products: OrderItem[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="head">
        <h1>My Orders</h1>
        <a routerLink="/" class="back">Home</a>
      </div>

      @if (loading()) {
        <p class="state">Loading orders...</p>
      } @else if (error()) {
        <p class="state error">{{ error() }}</p>
      } @else if (orders().length === 0) {
        <p class="state">No orders yet.</p>
      } @else {
        <div class="list">
          @for (order of orders(); track order.id) {
            <article class="order">
              <div class="top">
                <div>
                  <h3>#{{ order.id }}</h3>
                  <p>{{ order.createdAt | date: 'medium' }}</p>
                </div>
                <div class="status">{{ order.status }}</div>
              </div>

              <p>Payment: {{ order.paymentMethod }}</p>
              <p>Total: $ {{ order.totalAmount.toFixed(2) }}</p>
              <p>Items: {{ order.products.length }}</p>

              <div class="actions">
                <button (click)="viewDetails(order.id)">Refresh Details</button>
                @if (order.status === 'pending') {
                  <button class="danger" (click)="cancel(order.id)">Cancel</button>
                }
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1000px;
        margin: 0 auto;
        padding: 24px;
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .back {
        color: #6c63ff;
      }
      .state {
        text-align: center;
      }
      .state.error {
        color: #c62828;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .order {
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 14px;
        background: #fff;
      }
      .top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .top h3 {
        margin: 0;
      }
      .top p {
        margin: 2px 0 0;
        color: #666;
      }
      .status {
        padding: 6px 10px;
        border-radius: 20px;
        background: #e3f2fd;
        color: #1565c0;
        text-transform: capitalize;
      }
      .actions {
        display: flex;
        gap: 10px;
      }
      button {
        border: none;
        border-radius: 8px;
        padding: 8px 10px;
        background: #6c63ff;
        color: #fff;
      }
      .danger {
        background: #c62828;
      }
    `,
  ],
})
export class OrdersComponent implements OnInit {
  private api = inject(ElvoraApiService);

  loading = signal(true);
  error = signal<string | null>(null);
  orders = signal<OrderModel[]>([]);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getMyOrders().subscribe({
      next: (res: any) => {
        const payload = res?.data ?? res ?? {};
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.orders)
            ? payload.orders
            : [];

        this.orders.set(
          list.map((o: any) => ({
            id: String(o?._id ?? o?.id ?? ''),
            status: String(o?.status ?? 'pending'),
            paymentMethod: String(o?.paymentMethod ?? 'cash'),
            totalAmount: Number(o?.totalAmount ?? 0),
            createdAt: String(o?.createdAt ?? new Date().toISOString()),
            products: Array.isArray(o?.products)
              ? o.products.map((p: any) => ({
                  product: String(p?.product?._id ?? p?.product ?? ''),
                  quantity: Number(p?.quantity ?? 1),
                  price: Number(p?.price ?? 0),
                }))
              : [],
          })),
        );

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.data?.message ?? 'Failed to load orders.');
        this.loading.set(false);
      },
    });
  }

  cancel(orderId: string): void {
    this.api.cancelOrder(orderId).subscribe({
      next: () => this.loadOrders(),
      error: () => this.loadOrders(),
    });
  }

  viewDetails(orderId: string): void {
    this.api.getOrderById(orderId).subscribe({
      next: () => this.loadOrders(),
      error: () => this.loadOrders(),
    });
  }
}
