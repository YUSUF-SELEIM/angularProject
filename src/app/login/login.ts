import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Shop Login</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              formControlName="username"
              placeholder="Username"
              autocomplete="username"
            />
            @if (f['username'].invalid && f['username'].touched) {
              <span class="error">Username is required.</span>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Password"
              autocomplete="current-password"
            />
            @if (f['password'].invalid && f['password'].touched) {
              <span class="error">Password is required.</span>
            }
          </div>

          @if (loginError()) {
            <div class="login-error">Invalid username or password.</div>
          }

          <button type="submit" class="btn-primary" [disabled]="form.invalid">Login</button>
        </form>

        <a class="back" routerLink="/">← Back to shop</a>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 60px);
        padding: 20px;
        background: var(--bg, #f5f5f5);
      }
      .login-card {
        background: var(--card-bg, white);
        color: var(--text, #111);
        padding: 40px;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
        width: 100%;
        max-width: 400px;
      }
      h1 {
        margin: 0 0 6px;
        font-size: 24px;
      }
      .hint {
        font-size: 13px;
        color: #888;
        margin-bottom: 24px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 16px;
      }
      label {
        font-size: 14px;
        font-weight: 600;
      }
      input {
        padding: 10px 14px;
        border: 1.5px solid var(--border, #e0e0e0);
        border-radius: 8px;
        font-size: 15px;
        background: var(--input-bg, white);
        color: var(--text, #111);
        outline: none;
        transition: border-color 0.2s;
      }
      input:focus {
        border-color: #6c63ff;
      }
      .error {
        font-size: 12px;
        color: #e53935;
      }
      .login-error {
        background: #fdecea;
        color: #c62828;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 12px;
      }
      .btn-primary {
        width: 100%;
        padding: 12px;
        background: #6c63ff;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-primary:hover:not(:disabled) {
        background: #574fd6;
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .back {
        display: block;
        text-align: center;
        margin-top: 20px;
        color: #888;
        font-size: 14px;
      }
    `,
  ],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loginError = signal(false);

  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  // f is a shorthand to access controls — avoids verbose form.controls['name'] everywhere
  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.value;
    const ok = this.auth.login(username!, password!);

    if (ok) {
      // Navigate based on role: admin → dashboard, user → home
      const dest = this.auth.isAdmin() ? '/dashboard' : '/';
      this.router.navigateByUrl(dest);
    } else {
      this.loginError.set(true);
    }
  }
}
