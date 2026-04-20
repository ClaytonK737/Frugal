import { ArrowLeft, BookOpen, Heart, Star, PlusCircle, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PriceComparisonTable from '../components/ui/PriceComparisonTable';
import { mockPriceComparisons, mockTextbooks } from '../data/mockData';
import { Textbook } from '../types';

export default function BookDetailPage() {
  const { pageParams, navigate, addToWishlist, toggleFavorite, favorites, wishlist } = useApp();

  const book = (pageParams.book as Textbook) || mockTextbooks[0];

  const isFavorited = favorites.some((f) => f.productId === book.productId);
  const isInWishlist = wishlist.some((w) => w.book.productId === book.productId);
  const bestPrice = Math.min(...mockPriceComparisons.map((p) => p.price));
  const savings = book.price - bestPrice;
  const savingsPct = Math.round((savings / book.price) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('search')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="aspect-[3/4] bg-slate-100">
              {book.imageUrl ? (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-slate-300" />
                </div>
              )}
            </div>

            <div className="p-5 space-y-3">
              <button
                onClick={() => addToWishlist(book)}
                disabled={isInWishlist}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all ${
                  isInWishlist
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {isInWishlist ? (
                  <>
                    <Heart className="w-4 h-4" fill="currentColor" />
                    In Your Wishlist
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Add to Wishlist
                  </>
                )}
              </button>

              <button
                onClick={() => toggleFavorite(book)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm border transition-all ${
                  isFavorited
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Star className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
                {isFavorited ? 'Unfavorite' : 'Save as Favorite'}
              </button>

              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">{book.author}</p>
                <h1 className="text-2xl font-bold text-slate-800 leading-tight">{book.title}</h1>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'ISBN', value: book.isbn },
                { label: 'Edition', value: book.edition },
                { label: 'Publisher', value: book.publisher },
                { label: 'Category', value: 'Textbook' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm text-slate-700 font-medium">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div>
                <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-0.5">Best Price Found</p>
                <p className="text-3xl font-extrabold text-emerald-700">${bestPrice.toFixed(2)}</p>
              </div>
              {savings > 0 && (
                <div className="border-l border-emerald-200 pl-4">
                  <p className="text-xs text-slate-500 mb-0.5">vs list price ${book.price.toFixed(2)}</p>
                  <p className="text-lg font-bold text-emerald-600">
                    Save ${savings.toFixed(2)} ({savingsPct}%)
                  </p>
                </div>
              )}
            </div>

            {book.description && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">About This Book</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{book.description}</p>
              </div>
            )}
          </div>

          <PriceComparisonTable comparisons={mockPriceComparisons} listPrice={book.price} />

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Student Marketplace Listings</h3>
              <button
                onClick={() => navigate('marketplace')}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View all
              </button>
            </div>
            <div className="text-center py-8 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No peer listings yet for this book.</p>
              <button
                onClick={() => navigate('create-listing')}
                className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700"
              >
                Create a listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
