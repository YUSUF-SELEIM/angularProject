import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { ProductDetailComponent } from './product-detail/product-detail';
import { AddProductComponent } from './add-product/add-product';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products/add', component: AddProductComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: '**', redirectTo: '' },
];
