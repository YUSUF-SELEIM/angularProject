import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { ProductDetailComponent } from './product-detail/product-detail';
import { AddProductComponent } from './add-product/add-product';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { DashboardComponent } from './dashboard/dashboard';
import { CartComponent } from './cart/cart';
import { CheckoutComponent } from './checkout/checkout';
import { CheckoutSuccessComponent } from './checkout-success/checkout-success';
import { CheckoutCancelComponent } from './checkout-cancel/checkout-cancel';
import { OrdersComponent } from './orders/orders';
import { adminGuard, authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
  { path: 'checkout/success', component: CheckoutSuccessComponent, canActivate: [authGuard] },
  { path: 'checkout/cancel', component: CheckoutCancelComponent, canActivate: [authGuard] },
  { path: 'success', component: CheckoutSuccessComponent, canActivate: [authGuard] },
  { path: 'cancel', component: CheckoutCancelComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'products/add', component: AddProductComponent, canActivate: [adminGuard] },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: '**', redirectTo: '' },
];
