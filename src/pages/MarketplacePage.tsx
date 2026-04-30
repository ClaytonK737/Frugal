import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Filter, Loader2 } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import ListingCard from '../components/ui/ListingCard';
import { SaleListing } from '../types';

type ConditionFilter = 'all' | SaleListing['condition'];

const conditionOptions: { value: ConditionFilter; label: string }[] = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export default function MarketplacePage() {
  const { navigate, isAuthenticated, user } = useApp();
  const [listings, setListings] = useState<SaleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [condition, setCondition] = useState<ConditionFilter>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest');

  useEffect(() => {
    const fetchListings = async () => {
      const snap = await getDocs(collection(db, 'listings'));
      const data = snap.docs.map((d) => ({ listingId: d.id, ...d.data() } as SaleListing));
      setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, []);

  const handleMarkSold = async (listingId: string) => {
    await updateDoc(doc(db, 'listings', listingId), { status: 'sold' });
    setListings((prev) =>
      prev.map((l) => (l.listingId === listingId ? { ...l, status: 'sold' } : l))
    );
  };

  const handleDelete = async (listingId: string) => {
    await deleteDoc(doc(db, 'listings', listingId));
    setListings((prev) => prev.filter((l) => l.listingId !== listingId));
  };

  const filtered = listings
    .filter((l) => l.status === 'active')
    .filter((l) => condition === 'all' || l.condition === condition)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1">
            Buy and sell textbooks directly with other students
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => navigate('create-listing')}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Listing
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600 font-medium shrink-0">Condition:</span>
          <div className="flex gap-1 flex-wrap">
            {conditionOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCondition(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  condition === value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-slate-600 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-400 text-slate-700"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{filtered.length}</span>{' '}
              active {filtered.length === 1 ? 'listing' : 'listings'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-14 h-14 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No listings found</h3>
              <p className="text-slate-500 text-sm mb-6">Try adjusting your filters.</p>
              {isAuthenticated && (
                <button
                  onClick={() => navigate('create-listing')}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Post a Listing
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((listing) => (
                <ListingCard
                  key={listing.listingId}
                  listing={listing}
                  isOwner={user?.userId === listing.sellerId}
                  onContact={() => { if (!isAuthenticated) navigate('login'); }}
                  onMarkSold={() => handleMarkSold(listing.listingId)}
                  onDelete={() => handleDelete(listing.listingId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {!isAuthenticated && (
        <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <p className="text-slate-700 font-medium mb-3">
            Sign in to contact sellers or post your own listings
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('login')}
              className="px-5 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('register')}
              className="px-5 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:border-slate-300 transition-colors text-sm"
            >
              Create Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
