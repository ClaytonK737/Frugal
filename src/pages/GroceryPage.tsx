import { useState, useEffect } from 'react';
import { ShoppingBag, MapPin, AlertCircle, Loader2, Tag, Store } from 'lucide-react';
import {
  getUserLocation,
  getNearbyKrogerStores,
  searchGroceries,
  GroceryProduct,
  KrogerStore,
} from '../lib/groceries';

export default function GroceryPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroceryProduct[]>([]);
  const [stores, setStores] = useState<KrogerStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<KrogerStore | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');

  // Auto-locate nearby Kroger stores on page load
  useEffect(() => {
    handleLocate();
  }, []);

  const handleLocate = async () => {
    setLocating(true);
    setLocationError('');
    try {
      const { lat, lng } = await getUserLocation();
      const nearby = await getNearbyKrogerStores(lat, lng);
      setStores(nearby);
      if (nearby.length > 0) setSelectedStore(nearby[0]);
    } catch {
      setLocationError('Could not determine your location. You can still search without store-specific pricing.');
    } finally {
      setLocating(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const products = await searchGroceries(query, selectedStore?.location_id);
      setResults(products);
    } catch {
      setError('Failed to fetch grocery results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Grocery Search</h1>
        <p className="text-slate-500 text-sm">Search Kroger products and compare prices near you</p>
      </div>

      {/* Store Locator */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">Nearby Kroger</span>
          </div>

          {locating && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Finding stores near you...
            </div>
          )}

          {!locating && stores.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={selectedStore?.location_id || ''}
                onChange={(e) => {
                  const store = stores.find((s) => s.location_id === e.target.value) || null;
                  setSelectedStore(store);
                }}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {stores.map((s) => (
                  <option key={s.location_id} value={s.location_id}>
                    {s.name} — {s.city} ({s.distance?.toFixed(1)} mi)
                  </option>
                ))}
              </select>
              <button
                onClick={handleLocate}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Refresh
              </button>
            </div>
          )}

          {!locating && stores.length === 0 && !locationError && (
            <button
              onClick={handleLocate}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <MapPin className="w-3.5 h-3.5" />
              Find stores near me
            </button>
          )}
        </div>

        {locationError && (
          <p className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {locationError}
          </p>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for groceries (e.g. milk, chicken, pasta...)"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results count */}
      {searched && !loading && (
        <div className="text-sm text-slate-500 mb-4">
          <span className="font-semibold text-slate-800">{results.length}</span>{' '}
          {results.length === 1 ? 'result' : 'results'} for{' '}
          <span className="font-semibold text-slate-800">"{query}"</span>
          {selectedStore && (
            <span className="ml-1 text-slate-400">
              at {selectedStore.name}, {selectedStore.city}
            </span>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-5 bg-slate-200 rounded w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && !error && (
        <div className="text-center py-16">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No results found</h3>
          <p className="text-slate-500 text-sm">Try a different search term.</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {results.map((product) => (
            <div
              key={product.product_id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product image */}
              <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <ShoppingCart className="w-12 h-12 text-slate-200" />
                )}
              </div>

              <div className="p-4">
                {/* Brand + category */}
                <div className="flex items-center gap-2 mb-1">
                  {product.brand && (
                    <span className="text-xs text-slate-400 font-medium">{product.brand}</span>
                  )}
                  {product.category && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-1 line-clamp-2">
                  {product.name}
                </h3>

                {/* Size */}
                {product.size && (
                  <p className="text-xs text-slate-400 mb-2">{product.size}</p>
                )}

                {/* Pricing */}
                <div className="mt-auto">
                  {product.regular_price != null ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.promo_price != null && product.promo_price < product.regular_price ? (
                        <>
                          <span className="text-lg font-bold text-emerald-600">
                            ${product.promo_price.toFixed(2)}
                          </span>
                          <span className="text-sm text-slate-400 line-through">
                            ${product.regular_price.toFixed(2)}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                            <Tag className="w-3 h-3" />
                            Sale
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-slate-800">
                          ${product.regular_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">Price unavailable</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No search yet */}
      {!searched && !loading && (
        <div className="text-center py-16">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Find grocery deals</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Search for any grocery item and we'll pull live Kroger pricing near you.
          </p>
        </div>
      )}
    </div>
  );
}
