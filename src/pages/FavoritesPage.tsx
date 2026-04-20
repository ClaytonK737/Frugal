import { Star, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BookCard from '../components/ui/BookCard';

export default function FavoritesPage() {
  const { favorites, navigate, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Star className="w-14 h-14 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Sign in to view favorites</h2>
        <p className="text-slate-500 text-sm mb-6">Save your favorite books for quick access.</p>
        <button
          onClick={() => navigate('login')}
          className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Favorites</h1>
        <p className="text-slate-500 text-sm mt-1">
          {favorites.length} {favorites.length === 1 ? 'book' : 'books'} marked as favorite
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No favorites yet</h3>
          <p className="text-slate-500 text-sm mb-6">
            Click the star icon on any book to save it here.
          </p>
          <button
            onClick={() => navigate('search')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors mx-auto"
          >
            <BookOpen className="w-4 h-4" />
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map((book) => (
            <BookCard key={book.productId} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
