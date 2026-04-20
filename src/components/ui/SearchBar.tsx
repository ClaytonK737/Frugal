import { useState } from 'react';
import { Search, Hash, User, BookOpen, ChevronDown } from 'lucide-react';
import { SearchType } from '../../types';

interface SearchBarProps {
  onSearch: (query: string, type: SearchType) => void;
  initialQuery?: string;
  initialType?: SearchType;
  size?: 'sm' | 'lg';
}

const searchTypes: { value: SearchType; label: string; icon: React.ElementType }[] = [
  { value: 'title', label: 'Title', icon: BookOpen },
  { value: 'isbn', label: 'ISBN', icon: Hash },
  { value: 'author', label: 'Author', icon: User },
];

export default function SearchBar({
  onSearch,
  initialQuery = '',
  initialType = 'title',
  size = 'lg',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<SearchType>(initialType);
  const [typeOpen, setTypeOpen] = useState(false);

  const activeType = searchTypes.find((t) => t.value === searchType)!;
  const ActiveIcon = activeType.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim(), searchType);
  };

  const isLg = size === 'lg';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex items-stretch bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all overflow-hidden ${isLg ? 'h-14' : 'h-10'}`}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setTypeOpen(!typeOpen)}
            className={`h-full flex items-center gap-2 px-4 border-r border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors ${isLg ? 'text-sm' : 'text-xs'}`}
          >
            <ActiveIcon className={isLg ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            <span className="font-medium hidden sm:block">{activeType.label}</span>
            <ChevronDown className={`${isLg ? 'w-3.5 h-3.5' : 'w-3 h-3'} text-slate-400`} />
          </button>

          {typeOpen && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-10">
              {searchTypes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setSearchType(value); setTypeOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                    searchType === value
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            searchType === 'title' ? 'Search by book title...' :
            searchType === 'isbn' ? 'Enter ISBN (e.g. 978-0262046305)...' :
            'Search by author name...'
          }
          className={`flex-1 px-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 ${isLg ? 'text-base' : 'text-sm'}`}
        />

        <button
          type="submit"
          className={`flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors px-5 ${isLg ? 'text-sm' : 'text-xs px-4'}`}
        >
          <Search className={isLg ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          <span className="hidden sm:block">Search</span>
        </button>
      </div>
    </form>
  );
}
