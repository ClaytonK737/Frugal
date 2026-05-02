import { auth } from './firebase';
import { Textbook, SaleListing, WishlistItem } from '../types';

const BASE = 'http://127.0.0.1:8000/api';

async function authHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Map Django textbook shape → frontend Textbook type
function mapTextbook(d: Record<string, unknown>): Textbook {
  return {
    productId: (d.google_books_id as string) || String(d.id),
    name: d.title as string,
    title: d.title as string,
    author: d.author as string,
    isbn: (d.isbn as string) ?? '',
    edition: (d.edition as string) ?? '',
    publisher: (d.publisher as string) ?? '',
    description: (d.description as string) ?? '',
    price: parseFloat(d.price as string),
    category: 'textbook',
    createdDate: d.created_date as string,
    imageUrl: (d.image_url as string) ?? '',
  };
}

// Map Django listing shape → frontend SaleListing type
function mapListing(d: Record<string, unknown>): SaleListing {
  return {
    listingId: String(d.id),
    price: parseFloat(d.price as string),
    description: (d.description as string) ?? '',
    status: d.status as SaleListing['status'],
    condition: d.condition as SaleListing['condition'],
    sellerId: d.seller_id as string,
    sellerName: d.seller_name as string,
    createdDate: d.created_date as string,
    product: mapTextbook(d.book as Record<string, unknown>),
  };
}

// Ensure a textbook exists in Django, returns its numeric PK
export async function getOrCreateTextbook(book: Textbook): Promise<number> {
  const headers = await authHeaders();

  // Check by google_books_id first
  if (book.productId) {
    const res = await fetch(`${BASE}/textbooks/?google_books_id=${book.productId}`, { headers });
    const data = await res.json();
    if (data.length > 0) return data[0].id as number;
  }

  // Create (or get if duplicate)
  const res = await fetch(`${BASE}/textbooks/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: book.title,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      edition: book.edition,
      publisher: book.publisher,
      description: book.description,
      price: book.price,
      image_url: book.imageUrl ?? '',
      category: 'textbook',
      google_books_id: book.productId,
    }),
  });
  const data = await res.json();
  return data.id as number;
}

// --- Listings ---

export async function fetchListings(isbn?: string): Promise<SaleListing[]> {
  const headers = await authHeaders();
  const url = isbn ? `${BASE}/listings/?isbn=${isbn}` : `${BASE}/listings/`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  return (data as Record<string, unknown>[]).map(mapListing);
}

export async function createListing(
  book: Textbook,
  price: number,
  condition: SaleListing['condition'],
  description: string,
): Promise<SaleListing> {
  const headers = await authHeaders();
  const bookId = await getOrCreateTextbook(book);
  const res = await fetch(`${BASE}/listings/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ book_id: bookId, price, condition, description }),
  });
  if (!res.ok) throw new Error('Failed to create listing.');
  return mapListing(await res.json());
}

export async function markListingSold(listingId: string): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${BASE}/listings/${listingId}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'sold' }),
  });
}

export async function deleteListing(listingId: string): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${BASE}/listings/${listingId}/`, { method: 'DELETE', headers });
}

// --- Wishlist ---

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/wishlist/`, { headers });
  const data = await res.json();
  return (data as Record<string, unknown>[]).map((d) => ({
    djangoId: d.id as number,
    book: mapTextbook(d.book as Record<string, unknown>),
    addedDate: d.added_date as string,
  }));
}

export async function addToWishlist(book: Textbook): Promise<WishlistItem> {
  const headers = await authHeaders();
  const bookId = await getOrCreateTextbook(book);
  const res = await fetch(`${BASE}/wishlist/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ book_id: bookId }),
  });
  if (!res.ok) throw new Error('Failed to add to wishlist.');
  const d = await res.json();
  return {
    djangoId: d.id as number,
    book: mapTextbook(d.book as Record<string, unknown>),
    addedDate: d.added_date as string,
  };
}

export async function removeFromWishlist(djangoId: number): Promise<void> {
  const headers = await authHeaders();
  await fetch(`${BASE}/wishlist/${djangoId}/`, { method: 'DELETE', headers });
}
