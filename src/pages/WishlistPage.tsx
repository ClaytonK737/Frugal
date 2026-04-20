import { Heart, Trash2, Download, DollarSign, TrendingDown, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, navigate, isAuthenticated } = useApp();

  const totalListPrice = wishlist.reduce((sum, w) => sum + w.book.price, 0);
  const totalBestPrice = wishlist.reduce((sum, w) => sum + (w.lowestPrice ?? w.book.price), 0);
  const totalSavings = totalListPrice - totalBestPrice;

  const handleExport = () => {
    const header = 'Title,Author,ISBN,Edition,Publisher,List Price,Best Price\n';
    const rows = wishlist.map((w) =>
      `"${w.book.title}","${w.book.author}","${w.book.isbn}","${w.book.edition}","${w.book.publisher}",${w.book.price.toFixed(2)},${(w.lowestPrice ?? w.book.price).toFixed(2)}`
    );
    const csv = header + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'frugal_wishlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Heart className="w-14 h-14 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Sign in to view your wishlist</h2>
        <p className="text-slate-500 text-sm mb-6">Save books to your wishlist and track the best prices.</p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Wishlist</h1>
          <p className="text-slate-500 text-sm mt-1">{wishlist.length} {wishlist.length === 1 ? 'book' : 'books'} saved</p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {wishlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Books in list', value: wishlist.length.toString(), color: 'text-blue-600 bg-blue-50' },
            { icon: DollarSign, label: 'List price total', value: `$${totalListPrice.toFixed(2)}`, color: 'text-slate-600 bg-slate-100' },
            { icon: TrendingDown, label: 'Best price total', value: `$${totalBestPrice.toFixed(2)}`, sub: `Save $${totalSavings.toFixed(2)}`, color: 'text-emerald-600 bg-emerald-50' },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-xl font-bold text-slate-800">{value}</p>
                {sub && <p className="text-xs text-emerald-600 font-medium">{sub}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-14 h-14 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500 text-sm mb-6">Search for textbooks and add them to your wishlist.</p>
          <button
            onClick={() => navigate('search')}
            className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Search Books
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {wishlist.map(({ book, addedDate, lowestPrice }) => {
              const best = lowestPrice ?? book.price;
              const saved = book.price - best;
              return (
                <div key={book.productId} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors">
                  <div
                    className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden cursor-pointer shrink-0"
                    onClick={() => navigate('book-detail', { book })}
                  >
                    {book.imageUrl ? (
                      <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => navigate('book-detail', { book })}
                      className="text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors line-clamp-1 text-left"
                    >
                      {book.title}
                    </button>
                    <p className="text-xs text-slate-400 mt-0.5">{book.author} &middot; {book.edition}</p>
                    <p className="text-xs text-slate-300 mt-0.5">Added {new Date(addedDate).toLocaleDateString()}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-slate-800">${best.toFixed(2)}</p>
                    {saved > 0 && (
                      <p className="text-xs text-emerald-600 font-medium">
                        Save ${saved.toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 line-through">${book.price.toFixed(2)}</p>
                  </div>

                  <button
                    onClick={() => removeFromWishlist(book.productId)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 px-5 py-4 flex items-center justify-between border-t border-slate-200">
            <div>
              <span className="text-sm font-semibold text-slate-700">Estimated total: </span>
              <span className="text-lg font-bold text-emerald-600">${totalBestPrice.toFixed(2)}</span>
              <span className="text-xs text-slate-400 ml-2">(best prices)</span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
