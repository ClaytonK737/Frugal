export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  wishList: Textbook[];
  savedMoney?: number;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: 'textbook' | 'grocery' | 'clothing';
  createdDate: string;
  imageUrl?: string;
}

export interface Textbook extends Product {
  category: 'textbook';
  isbn: string;
  title: string;
  author: string;
  edition: string;
  publisher: string;
}

export interface Groceries extends Product {
  category: 'grocery';
  expirationDate: string;
  weight: number;
  brand: string;
  nutritionalInfo: string;
  organic: boolean;
}

export interface Clothing extends Product {
  category: 'clothing';
  size: string;
  color: string;
  brand: string;
  material: string;
  gender: string;
}

export interface SaleListing {
  listingId: string;
  price: number;
  description: string;
  status: 'active' | 'sold' | 'inactive';
  product: Textbook;
  sellerId: string;
  sellerName: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  createdDate: string;
}

export interface PriceComparison {
  platform: string;
  price: number;
  format: 'new' | 'used' | 'rental' | 'digital';
  url: string;
  inStock: boolean;
}

export interface Session {
  sessionId: string;
  loginTime: string;
  logoutTime: string | null;
}

export interface Transaction {
  transactionId: string;
  transactionDate: string;
  amount: number;
  paymentMethod: string;
}

export interface WishlistItem {
  book: Textbook;
  addedDate: string;
  lowestPrice?: number;
}

export type SearchType = 'title' | 'isbn' | 'author';
export type SortOption = 'price-asc' | 'price-desc' | 'relevance' | 'title';

export type Page =
  | 'home'
  | 'login'
  | 'register'
  | 'search'
  | 'book-detail'
  | 'wishlist'
  | 'favorites'
  | 'marketplace'
  | 'create-listing'
  | 'profile';
