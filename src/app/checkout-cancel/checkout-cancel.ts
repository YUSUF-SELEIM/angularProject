import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-cancel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <h2>Payment cancelled</h2>
      <p>Your payment was not completed. You can try again.</p>
      <a routerLink="/checkout" class="btn">Back to checkout</a>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 680px;
        margin: 0 auto;
        padding: 40px 24px;
        text-align: center;
      }
      .btn {
        padding: 10px 16px;
        border-radius: 10px;
        background: #6c63ff;
        color: #fff;
        text-decoration: none;
      }
    `,
  ],
})
export class CheckoutCancelComponent {}
