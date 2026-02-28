import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { ProductDetailComponent } from './product-detail/product-detail';
import { AddProductComponent } from './add-product/add-product';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { adminGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'products/add', component: AddProductComponent, canActivate: [adminGuard] },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: '**', redirectTo: '' },
];
