import { Component, inject, HostBinding } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from './services/product.service';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a class="brand" routerLink="/">🛍 Shop</a>

      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Home
        </a>

        @if (auth.isAdmin()) {
          <a routerLink="/dashboard" routerLinkActive="active" class="admin-btn">Dashboard</a>
          <a routerLink="/products/add" routerLinkActive="active" class="add-btn">+ Add Product</a>
        }
      </div>

      @if (svc.cartItemCount() > 0) {
        <div class="cart-badge">
          {{ svc.cartItemCount() }} items
          <span class="cart-total">\${{ svc.cartTotal() }}</span>
        </div>
      }

      <div class="right-actions">
        <button
          class="theme-toggle"
          (click)="theme.toggleTheme()"
          [title]="theme.isDark() ? 'Switch to light' : 'Switch to dark'"
        >
          {{ theme.isDark() ? '☀️' : '🌙' }}
        </button>

        @if (auth.isLoggedIn()) {
          <span class="user-chip">
            {{ auth.currentUser()?.role === 'admin' ? '🛡' : '👤' }}
            {{ auth.currentUser()?.username }}
          </span>
          <button class="btn-logout" (click)="auth.logout()">Logout</button>
        } @else {
          <a routerLink="/login" class="btn-login">Login</a>
        }
      </div>
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
        gap: 10px;
        padding: 0 24px;
        height: 60px;
        background: var(--navbar-bg, white);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        overflow-x: auto;
      }

      .brand {
        font-size: 20px;
        font-weight: 800;
        color: #ff6b6b;
        text-decoration: none;
        letter-spacing: -0.5px;
        margin-right: auto;
        white-space: nowrap;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .nav-links a {
        padding: 7px 14px;
        border-radius: 20px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        color: var(--nav-link, #555);
        transition: all 0.2s;
        white-space: nowrap;
      }
      .nav-links a:hover {
        background: var(--hover-bg, #f5f5f5);
        color: var(--text, #333);
      }
      .nav-links a.active {
        background: #fff0f0;
        color: #ff6b6b;
      }
      .nav-links a.add-btn {
        background: #ff6b6b;
        color: white;
      }
      .nav-links a.add-btn:hover {
        background: #ff5252;
      }
      .nav-links a.add-btn.active {
        background: #ff5252;
        color: white;
      }
      .nav-links a.admin-btn {
        background: #ede7f6;
        color: #5e35b1;
      }
      .nav-links a.admin-btn:hover {
        background: #d1c4e9;
      }
      .nav-links a.admin-btn.active {
        background: #5e35b1;
        color: white;
      }

      .cart-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #fff0f0;
        border: 1.5px solid #ffd0d0;
        padding: 6px 12px;
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

      .right-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 6px;
        flex-shrink: 0;
      }

      .theme-toggle {
        background: transparent;
        border: 1.5px solid var(--border, #e0e0e0);
        border-radius: 50%;
        width: 36px;
        height: 36px;
        font-size: 17px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .theme-toggle:hover {
        background: var(--hover-bg, #f5f5f5);
      }

      .user-chip {
        font-size: 13px;
        font-weight: 600;
        color: var(--text, #333);
        background: var(--hover-bg, #f5f5f5);
        padding: 5px 12px;
        border-radius: 20px;
        white-space: nowrap;
      }

      .btn-logout {
        padding: 6px 14px;
        background: #fdecea;
        color: #c62828;
        border: none;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }
      .btn-logout:hover {
        background: #ffcdd2;
      }

      .btn-login {
        padding: 7px 16px;
        background: #6c63ff;
        color: white;
        border-radius: 20px;
        text-decoration: none;
        font-size: 13px;
        font-weight: 700;
        white-space: nowrap;
      }
      .btn-login:hover {
        background: #574fd6;
      }

      main {
        flex: 1;
        width: 100%;
        background: var(--bg, #fafafa);
        color: var(--text, #111);
      }
    `,
  ],
})
export class App {
  protected svc = inject(ProductService);
  protected auth = inject(AuthService);
  protected theme = inject(ThemeService);

  @HostBinding('class.dark-theme')
  get darkClass(): boolean {
    return this.theme.isDark();
  }
}
