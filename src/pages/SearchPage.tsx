import { useState, useEffect } from 'react';
import { SlidersHorizontal, ArrowUpDown, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/ui/SearchBar';
import BookCard from '../components/ui/BookCard';
import { searchBooks } from '../lib/googleBooks';
import { Textbook, SearchType, SortOption } from '../types';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'title', label: 'Title A–Z' },
];

export default function SearchPage() {
  const { pageParams, navigate } = useApp();
  const [query, setQuery] = useState((pageParams.query as string) || '');
  const [searchType, setSearchType] = useState<SearchType>((pageParams.type as SearchType) || 'title');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [results, setResults] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const performSearch = async (q: string, type: SearchType) => {
    if (!q.trim()) return;
    setQuery(q);
    setSearchType(type);
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const books = await searchBooks(q, type);
      setResults(books);
    } catch {
      setError('Failed to fetch results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) performSearch(query, searchType);
  }, []);

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Search Textbooks</h1>
        <SearchBar
          onSearch={performSearch}
          initialQuery={query}
          initialType={searchType}
          size="lg"
        />
      </div>

      {searched && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="text-sm text-slate-500">
            {loading ? (
              'Searching...'
            ) : (
              <>
                <span className="font-semibold text-slate-800">{sortedResults.length}</span>{' '}
                {sortedResults.length === 1 ? 'result' : 'results'}
                {query && (
                  <> for <span className="font-semibold text-slate-800">"{query}"</span></>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:block">Sort by:</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {sortOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && searched && sortedResults.length === 0 && !error && (
        <div className="text-center py-16">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No results found</h3>
          <p className="text-slate-500 text-sm mb-6">
            Try searching by a different title, author, or ISBN.
          </p>
          <button
            onClick={() => navigate('search', {})}
            className="px-6 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}

      {!loading && sortedResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedResults.map((book) => (
            <BookCard key={book.productId} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
