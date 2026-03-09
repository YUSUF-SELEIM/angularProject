# API Migration Map (Fake/Mock -> Real)

Base URL used for all real APIs: `http://localhost:3000/api`

## Replaced in Current UI Flow

| Frontend Usage | Fake/Mock Endpoint | Real Endpoint Replacement | Status | File |
|---|---|---|---|---|
| Login | In-memory `MOCK_USERS` check | `POST /api/auth/login` then `GET /api/profile/me` | Replaced | `src/app/services/auth.service.ts` |
| Products list (home/dashboard) | `GET https://fakestoreapi.com/products?limit=10` | `GET /api/products?page=1&limit=10` | Replaced | `src/app/services/product.service.ts` |
| Create product | `POST https://fakestoreapi.com/products` | `POST /api/products` (Bearer token) | Replaced | `src/app/services/product.service.ts` |
| Update product | `PUT https://fakestoreapi.com/products/:id` | `PATCH /api/products/:id` (Bearer token) | Replaced | `src/app/services/product.service.ts` |
| Delete product | `DELETE https://fakestoreapi.com/products/:id` | `DELETE /api/products/:id` (Bearer token) | Replaced | `src/app/services/product.service.ts` |
| Add to cart from product details | Local-only cart behavior | `POST /api/carts` with `{ productId }` + local UI update | Replaced | `src/app/services/product.service.ts` |
| Slider data | `fetch('https://fakestoreapi.com/products?limit=10')` | `GET /api/products?page=1&limit=10` | Replaced | `src/app/slider/slider.ts` |
| Legacy product service | `https://api.escuelajs.co/api/v1/products/?categoryId=2` | `GET /api/products?page=1&limit=10` | Replaced | `src/app/product.ts` |

## Full Endpoint Coverage Added

All Postman endpoints are now available through `ElvoraApiService`.

File: `src/app/services/elvora-api.service.ts`

| Module | Endpoint | Method | Service Method |
|---|---|---|---|
| Auth | `/auth/register` | POST | `register()` |
| Auth | `/auth/login` | POST | `login()` |
| Users | `/users?page=&limit=` | GET | `getUsers()` |
| Users | `/users/:id` | GET | `getUserById()` |
| Users | `/users/:id` | PATCH | `approveUser()` |
| Users | `/users/:id/restrict` | PATCH | `restrictUser()` |
| Users | `/users/:id` | DELETE | `deleteUser()` |
| Profile | `/profile/me` | GET | `getMyProfile()` |
| Profile | `/profile/update` | PUT | `updateProfile()` |
| Products | `/products?page=&limit=` | GET | `getProducts()` |
| Products | `/products/:id` | GET | `getProductById()` |
| Products | `/products` | POST | `createProduct()` |
| Products | `/products/:id` | PATCH | `updateProduct()` |
| Products | `/products/seller?page=&limit=` | GET | `getSellerProducts()` |
| Products | `/products/:id` | DELETE | `deleteProduct()` |
| Categories | `/categories` | GET | `getCategories()` |
| Categories | `/categories/:id` | GET | `getCategoryById()` |
| Categories | `/categories` | POST | `createCategory()` |
| Categories | `/categories/:id` | PATCH | `updateCategory()` |
| Categories | `/categories/:id` | DELETE | `deleteCategory()` |
| Reviews | `/reviews/product/:productId?page=&limit=` | GET | `getProductReviews()` |
| Reviews | `/reviews/product/:productId` | POST | `addReview()` |
| Reviews | `/reviews/:id` | GET | `getReviewById()` |
| Reviews | `/reviews/:id` | PATCH | `updateReview()` |
| Reviews | `/reviews/:id` | DELETE | `deleteReview()` |
| Reviews | `/reviews/me` | GET | `getMyReviews()` |
| Cart | `/carts` | POST | `addToCart()` |
| Cart | `/carts` | GET | `getMyCart()` |
| Cart | `/carts/:productId` | PATCH | `updateCartProductQuantity()` |
| Cart | `/carts/:productId` | DELETE | `deleteCartProduct()` |
| Cart | `/carts` | DELETE | `clearCart()` |
| Wishlist | `/wishlists` | POST | `addToWishlist()` |
| Wishlist | `/wishlists` | GET | `getMyWishlist()` |
| Wishlist | `/wishlists/:productId` | DELETE | `deleteWishlistProduct()` |
| Wishlist | `/wishlists/:productId/transfer` | POST | `transferWishlistProductToCart()` |
| Wishlist | `/wishlists` | DELETE | `clearWishlist()` |
| Favorites | `/favorites` | GET | `getMyFavorites()` |
| Favorites | `/favorites` | POST | `addToFavorites()` |
| Favorites | `/favorites/:productId` | DELETE | `deleteFavoriteProduct()` |
| Favorites | `/favorites` | DELETE | `clearFavorites()` |
| Checkout | `/checkout/single` | POST | `checkoutSingle()` |
| Checkout | `/checkout/multiple` | POST | `checkoutMultiple()` |
| Orders | `/orders` | GET | `getAllOrders()` |
| Orders | `/orders/my-orders` | GET | `getMyOrders()` |
| Orders | `/orders/:id` | GET | `getOrderById()` |
| Orders | `/orders/:id/cancel` | PATCH | `cancelOrder()` |
| Orders | `/orders/:id/status` | PATCH | `updateOrderStatus()` |
| Payment | `/payment/create-checkout-session` | POST | `createCheckoutSession()` |
| Payment | `/payment/confirm` | POST | `confirmPayment()` |

## Notes

- Product IDs were migrated from numeric to string to support ObjectId-style backend IDs.
- Login now sends email/password to backend and stores token in session storage.
- `ElvoraApiService` auto-picks token from `auth_token`, `admin_token`, `seller_token`, or `token` unless a token is passed explicitly.
