import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export type QuantityAction = '+' | '-';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AddReviewPayload {
  rating: number;
  title: string;
  comment: string;
}

export interface CheckoutSinglePayload {
  productId: string;
  quantity: number;
  shippingAddress: string;
  paymentMethod: string;
}

export interface CheckoutMultiplePayload {
  fromCart: boolean;
  shippingAddress: string;
  paymentMethod: string;
  products?: Array<{ productId: string; quantity: number }>;
}

@Injectable({ providedIn: 'root' })
export class ElvoraApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  // Auth
  register(payload: RegisterPayload): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/auth/login`, payload);
  }

  // Users
  getUsers(page = 1, limit = 10, token?: string): Observable<unknown> {
    return this.http.get<unknown>(
      `${this.baseUrl}/users?page=${page}&limit=${limit}`,
      this.withAuth(token),
    );
  }

  getUserById(userId: string, token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/users/${userId}`, this.withAuth(token));
  }

  approveUser(userId: string, token?: string): Observable<unknown> {
    return this.http.patch<unknown>(`${this.baseUrl}/users/${userId}`, {}, this.withAuth(token));
  }

  restrictUser(userId: string, token?: string): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.baseUrl}/users/${userId}/restrict`,
      {},
      this.withAuth(token),
    );
  }

  deleteUser(userId: string, token?: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/users/${userId}`, this.withAuth(token));
  }

  // Profile
  getMyProfile(token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/profile/me`, this.withAuth(token));
  }

  updateProfile(formData: FormData, token?: string): Observable<unknown> {
    return this.http.put<unknown>(`${this.baseUrl}/profile/update`, formData, this.withAuth(token));
  }

  // Products
  getProducts(page = 1, limit = 8): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/products?page=${page}&limit=${limit}`);
  }

  getProductById(productId: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/products/${productId}`);
  }

  createProduct(payload: FormData | Record<string, unknown>, token?: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/products`, payload, this.withAuth(token));
  }

  updateProduct(
    productId: string,
    payload: FormData | Record<string, unknown>,
    token?: string,
  ): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.baseUrl}/products/${productId}`,
      payload,
      this.withAuth(token),
    );
  }

  getSellerProducts(page = 1, limit = 10, token?: string): Observable<unknown> {
    return this.http.get<unknown>(
      `${this.baseUrl}/products/seller?page=${page}&limit=${limit}`,
      this.withAuth(token),
    );
  }

  deleteProduct(productId: string, token?: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/products/${productId}`, this.withAuth(token));
  }

  // Categories
  getCategories(): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/categories`);
  }

  getCategoryById(categoryId: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/categories/${categoryId}`);
  }

  createCategory(payload: FormData | Record<string, unknown>, token?: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/categories`, payload, this.withAuth(token));
  }

  updateCategory(
    categoryId: string,
    payload: FormData | Record<string, unknown>,
    token?: string,
  ): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.baseUrl}/categories/${categoryId}`,
      payload,
      this.withAuth(token),
    );
  }

  deleteCategory(categoryId: string, token?: string): Observable<unknown> {
    return this.http.delete<unknown>(
      `${this.baseUrl}/categories/${categoryId}`,
      this.withAuth(token),
    );
  }

  // Reviews
  getProductReviews(productId: string, page = 1, limit = 8): Observable<unknown> {
    return this.http.get<unknown>(
      `${this.baseUrl}/reviews/product/${productId}?page=${page}&limit=${limit}`,
    );
  }

  addReview(productId: string, payload: AddReviewPayload, token?: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.baseUrl}/reviews/product/${productId}`,
      payload,
      this.withAuth(token),
    );
  }

  getReviewById(reviewId: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/reviews/${reviewId}`);
  }

  updateReview(reviewId: string, payload: AddReviewPayload, token?: string): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.baseUrl}/reviews/${reviewId}`,
      payload,
      this.withAuth(token),
    );
  }

  deleteReview(reviewId: string, token?: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/reviews/${reviewId}`, this.withAuth(token));
  }

  getMyReviews(token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/reviews/me`, this.withAuth(token));
  }

  // Cart
  addToCart(productId: string, token?: string): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/carts`, { productId }, this.withAuth(token));
  }

  getMyCart(token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/carts`, this.withAuth(token));
  }

  updateCartProductQuantity(
    productId: string,
    action: QuantityAction,
    token?: string,
  ): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.baseUrl}/carts/${productId}`,
      { action },
      this.withAuth(token),
    );
  }

  deleteCartProduct(productId: string, token?: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/carts/${productId}`, this.withAuth(token));
  }

  clearCart(token?: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/carts`, this.withAuth(token));
  }

  // Wishlist
  addToWishlist(productId: string, token?: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.baseUrl}/wishlists`,
      { productId },
      this.withAuth(token),
    );
  }

  getMyWishlist(token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/wishlists`, this.withAuth(token));
  }

  deleteWishlistProduct(productId: string, token?: string): Observable<unknown> {
    return this.http.delete<unknown>(
      `${this.baseUrl}/wishlists/${productId}`,
      this.withAuth(token),
    );
  }

  transferWishlistProductToCart(
    productId: string,
    quantity: number,
    token?: string,
  ): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.baseUrl}/wishlists/${productId}/transfer`,
      { quantity },
      this.withAuth(token),
    );
  }

  clearWishlist(token?: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/wishlists`, this.withAuth(token));
  }

  // Favorites
  getMyFavorites(token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/favorites`, this.withAuth(token));
  }

  addToFavorites(productId: string, token?: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.baseUrl}/favorites`,
      { productId },
      this.withAuth(token),
    );
  }

  deleteFavoriteProduct(productId: string, token?: string): Observable<unknown> {
    return this.http.delete<unknown>(
      `${this.baseUrl}/favorites/${productId}`,
      this.withAuth(token),
    );
  }

  clearFavorites(token?: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.baseUrl}/favorites`, this.withAuth(token));
  }

  // Checkout
  checkoutSingle(payload: CheckoutSinglePayload, token?: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.baseUrl}/checkout/single`,
      payload,
      this.withAuth(token),
    );
  }

  checkoutMultiple(payload: CheckoutMultiplePayload, token?: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.baseUrl}/checkout/multiple`,
      payload,
      this.withAuth(token),
    );
  }

  // Orders
  getAllOrders(token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/orders`, this.withAuth(token));
  }

  getMyOrders(token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/orders/my-orders`, this.withAuth(token));
  }

  getOrderById(orderId: string, token?: string): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/orders/${orderId}`, this.withAuth(token));
  }

  cancelOrder(orderId: string, token?: string): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.baseUrl}/orders/${orderId}/cancel`,
      {},
      this.withAuth(token),
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus, token?: string): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.baseUrl}/orders/${orderId}/status`,
      { status },
      this.withAuth(token),
    );
  }

  // Payment
  createCheckoutSession(
    payload: { products: Array<unknown>; shippingAddress: string },
    token?: string,
  ): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.baseUrl}/payment/create-checkout-session`,
      payload,
      this.withAuth(token),
    );
  }

  confirmPayment(sessionId: string, token?: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.baseUrl}/payment/confirm`,
      { sessionId },
      this.withAuth(token),
    );
  }

  private withAuth(token?: string): { headers: HttpHeaders } {
    const resolvedToken = token ?? this.getBestTokenFromSession();
    const headers = resolvedToken
      ? new HttpHeaders({ Authorization: `Bearer ${resolvedToken}` })
      : new HttpHeaders();

    return { headers };
  }

  private getBestTokenFromSession(): string | null {
    return (
      sessionStorage.getItem('auth_token') ??
      sessionStorage.getItem('admin_token') ??
      sessionStorage.getItem('seller_token') ??
      sessionStorage.getItem('token')
    );
  }
}
