import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a class="brand" routerLink="/">🛍 Shop</a>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
          >Home</a
        >
        <a routerLink="/products/add" routerLinkActive="active" class="add-btn">+ Add Product</a>
      </div>
      @if (svc.cartItemCount() > 0) {
        <div class="cart-badge">
          🛒 {{ svc.cartItemCount() }} items
          <span class="cart-total">\${{ svc.cartTotal() }}</span>
        </div>
      }
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100%;
        font-family:
          'Inter',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
      }

      .navbar {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 16px 28px;
        height: 60px;
        background: white;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      }

      .brand {
        font-size: 20px;
        font-weight: 800;
        color: #ff6b6b;
        text-decoration: none;
        letter-spacing: -0.5px;
        margin-right: auto;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .nav-links a {
        padding: 7px 16px;
        border-radius: 20px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        color: #555;
        transition: all 0.2s;

        &:hover {
          background: #f5f5f5;
          color: #333;
        }
        &.active {
          background: #fff0f0;
          color: #ff6b6b;
        }
        &.add-btn {
          background: #ff6b6b;
          color: white;
        }
        &.add-btn:hover {
          background: #ff5252;
        }
        &.add-btn.active {
          background: #ff5252;
          color: white;
        }
      }

      .cart-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fff0f0;
        border: 1.5px solid #ffd0d0;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
        color: #c62828;
        white-space: nowrap;
      }

      .cart-total {
        font-size: 14px;
        font-weight: 800;
      }

      main {
        flex: 1;
        width: 100%;
        background: #fafafa;
      }
    `,
  ],
})
export class App {
  protected svc = inject(ProductService);
}
