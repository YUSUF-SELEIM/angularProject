import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="register-card">
        <h1>Create Account</h1>
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label for="name">Name</label>
            <input id="name" formControlName="name" placeholder="Your name" autocomplete="name" />
            @if (f['name'].invalid && f['name'].touched) {
              <span class="error">Name must be at least 3 characters.</span>
            }
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              formControlName="email"
              placeholder="name@example.com"
              autocomplete="email"
            />
            @if (f['email'].invalid && f['email'].touched) {
              <span class="error">Please enter a valid email.</span>
            }
          </div>

          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="At least 6 characters"
              autocomplete="new-password"
            />
            @if (f['password'].invalid && f['password'].touched) {
              <span class="error">Password must be at least 6 characters.</span>
            }
          </div>

          <div class="field">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Retype your password"
              autocomplete="new-password"
            />
            @if (f['confirmPassword'].invalid && f['confirmPassword'].touched) {
              <span class="error">Please confirm your password.</span>
            }
          </div>

          @if (errorMessage()) {
            <div class="register-error">{{ errorMessage() }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="form.invalid || isSubmitting()">
            {{ isSubmitting() ? 'Creating account...' : 'Register' }}
          </button>
        </form>

        <a class="switch" routerLink="/login">Already have an account? Login</a>
        <a class="back" routerLink="/">Back to shop</a>
      </div>
    </div>
  `,
  styles: [
    `
      .register-page {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 60px);
        padding: 20px;
        background: var(--bg, #f5f5f5);
      }
      .register-card {
        background: var(--card-bg, white);
        color: var(--text, #111);
        padding: 36px;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
        width: 100%;
        max-width: 420px;
      }
      h1 {
        margin: 0 0 14px;
        font-size: 24px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
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
      }
      input:focus {
        border-color: #6c63ff;
      }
      .error {
        font-size: 12px;
        color: #e53935;
      }
      .register-error {
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
      }
      .btn-primary:hover:not(:disabled) {
        background: #574fd6;
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .switch,
      .back {
        display: block;
        text-align: center;
        color: #888;
        font-size: 14px;
        margin-top: 14px;
      }
    `,
  ],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.errorMessage.set('Password and confirm password do not match.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.auth.register(name!, email!, password!).subscribe((result) => {
      this.isSubmitting.set(false);

      if (result.ok) {
        const dest = this.auth.isAdmin() ? '/dashboard' : '/';
        this.router.navigateByUrl(dest);
      } else {
        this.errorMessage.set(result.message ?? 'Registration failed.');
      }
    });
  }
}
