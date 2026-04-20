import { Heart, Star, BookOpen, PlusCircle } from 'lucide-react';
import { Textbook } from '../../types';
import { useApp } from '../../context/AppContext';

interface BookCardProps {
  book: Textbook;
  showAddToWishlist?: boolean;
}

export default function BookCard({ book, showAddToWishlist = true }: BookCardProps) {
  const { navigate, addToWishlist, toggleFavorite, favorites, wishlist } = useApp();

  const isFavorited = favorites.some((f) => f.productId === book.productId);
  const isInWishlist = wishlist.some((w) => w.book.productId === book.productId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div
        className="relative cursor-pointer"
        onClick={() => navigate('book-detail', { book })}
      >
        <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
          {book.imageUrl ? (
            <img
              src={book.imageUrl}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(book); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
            isFavorited
              ? 'bg-amber-400 text-white'
              : 'bg-white text-slate-400 hover:text-amber-400'
          }`}
        >
          <Star className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-4">
        <div
          className="cursor-pointer"
          onClick={() => navigate('book-detail', { book })}
        >
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
            {book.author}
          </p>
          <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {book.edition} &middot; {book.publisher}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-800">
              ${book.price.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 ml-1">list</span>
          </div>

          {showAddToWishlist && (
            <button
              onClick={() => addToWishlist(book)}
              disabled={isInWishlist}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isInWishlist
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {isInWishlist ? (
                <>
                  <Heart className="w-3.5 h-3.5" fill="currentColor" />
                  Saved
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Wishlist
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
