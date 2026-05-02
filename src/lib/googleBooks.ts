import { Textbook, PriceComparison } from '../types';

interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    description?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    listPrice?: { amount: number; currencyCode: string };
    retailPrice?: { amount: number; currencyCode: string };
  };
  saleInfo?: {
    listPrice?: { amount: number; currencyCode: string };
    retailPrice?: { amount: number; currencyCode: string };
  };
}

function extractISBN(volume: GoogleBooksVolume): string {
  const ids = volume.volumeInfo.industryIdentifiers ?? [];
  return (
    ids.find((i) => i.type === 'ISBN_13')?.identifier ??
    ids.find((i) => i.type === 'ISBN_10')?.identifier ??
    ''
  );
}

function estimateListPrice(volume: GoogleBooksVolume): number {
  const retail =
    volume.saleInfo?.retailPrice?.amount ??
    volume.saleInfo?.listPrice?.amount;
  if (retail && retail > 0) return retail;
  // Textbooks typically run $80–$180 — use a seeded estimate based on the volume id
  const seed = volume.id.charCodeAt(0) + volume.id.charCodeAt(1);
  return Math.round((80 + (seed % 100)) * 100) / 100;
}

export function generatePriceComparisons(listPrice: number): PriceComparison[] {
  const r = (min: number, max: number) =>
    Math.round((listPrice * (min + Math.random() * (max - min))) * 100) / 100;

  return ([
    { platform: 'Amazon',          price: r(0.90, 1.00), format: 'new'     as const, url: '#', inStock: true },
    { platform: 'Amazon',          price: r(0.50, 0.65), format: 'used'    as const, url: '#', inStock: true },
    { platform: 'Chegg',           price: r(0.28, 0.38), format: 'rental'  as const, url: '#', inStock: true },
    { platform: 'VitalSource',     price: r(0.45, 0.55), format: 'digital' as const, url: '#', inStock: true },
    { platform: 'eBay',            price: r(0.40, 0.58), format: 'used'    as const, url: '#', inStock: Math.random() > 0.3 },
    { platform: 'Barnes & Noble',  price: r(0.95, 1.05), format: 'new'     as const, url: '#', inStock: Math.random() > 0.4 },
  ] as PriceComparison[]).sort((a, b) => a.price - b.price);
}

function volumeToTextbook(volume: GoogleBooksVolume): Textbook {
  const info = volume.volumeInfo;
  const listPrice = estimateListPrice(volume);
  return {
    productId: volume.id,
    name: info.title ?? 'Unknown Title',
    title: info.title ?? 'Unknown Title',
    author: info.authors?.join(', ') ?? 'Unknown Author',
    isbn: extractISBN(volume),
    edition: '',
    publisher: info.publisher ?? '',
    description: info.description ?? '',
    price: listPrice,
    category: 'textbook',
    createdDate: new Date().toISOString().split('T')[0],
    imageUrl: info.imageLinks?.thumbnail?.replace('http://', 'https://'),
  };
}

export async function searchBooks(query: string, searchType: 'title' | 'isbn' | 'author'): Promise<Textbook[]> {
  const fieldMap = { title: 'intitle', isbn: 'isbn', author: 'inauthor' };
  const q = encodeURIComponent(`${fieldMap[searchType]}:${query}`);
  const key = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=20&printType=books${key ? `&key=${key}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch books');
  const data = await res.json();

  if (!data.items) return [];
  return (data.items as GoogleBooksVolume[]).map(volumeToTextbook);
}
