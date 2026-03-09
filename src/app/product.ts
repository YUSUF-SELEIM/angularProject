import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private api = 'http://localhost:3000/api/products?page=1&limit=10';

  constructor(private http: HttpClient) {}

  getProducts() {
    return this.http.get<any[]>(this.api);
  }
}
