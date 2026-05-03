const DJANGO_BASE = 'http://127.0.0.1:8000/api';

export interface GroceryProduct {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  image_url: string | null;
  regular_price: number | null;
  promo_price: number | null;
  size: string;
}

export interface KrogerStore {
  location_id: string;
  name: string;
  address: string;
  city: string;
  distance: number;
}

// Uses browser's built-in Geolocation API — no key needed
export function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err)
    );
  });
}

export async function getNearbyKrogerStores(lat: number, lng: number): Promise<KrogerStore[]> {
  const resp = await fetch(`${DJANGO_BASE}/groceries/stores/?lat=${lat}&lng=${lng}`);
  if (!resp.ok) throw new Error('Failed to fetch nearby stores');
  const data = await resp.json();
  return data.stores;
}

export async function searchGroceries(query: string, locationId?: string): Promise<GroceryProduct[]> {
  const params = new URLSearchParams({ q: query });
  if (locationId) params.append('location_id', locationId);
  const resp = await fetch(`${DJANGO_BASE}/groceries/search/?${params}`);
  if (!resp.ok) throw new Error('Failed to search groceries');
  const data = await resp.json();
  return data.results;
}
