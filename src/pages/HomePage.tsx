import { BookOpen, ShoppingBag, TrendingDown, Users, ArrowRight, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/ui/SearchBar';
import BookCard from '../components/ui/BookCard';
import { mockTextbooks } from '../data/mockData';
import { SearchType } from '../types';

export default function HomePage() {
  const { navigate } = useApp();

  const handleSearch = (query: string, type: SearchType) => {
    navigate('search', { query, type });
  };

  const features = [
    {
      icon: TrendingDown,
      title: 'Price Comparison',
      description: 'Compare textbook prices across Amazon, Chegg, VitalSource, and more in one place.',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: BookOpen,
      title: 'Smart Wishlist',
      description: 'Build your semester book list and get an instant cost estimate with the cheapest options.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: ShoppingBag,
      title: 'Student Marketplace',
      description: 'Buy and sell used textbooks directly from fellow students at your campus.',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Users,
      title: 'Built for Students',
      description: 'Designed specifically for college students to reduce everyday expenses.',
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <DollarSign className="w-4 h-4" />
              Save more. Stress less.
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Find the Best Deals on{' '}
              <span className="text-emerald-400">Textbooks</span> &amp; Essentials
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-xl">
              Frugal compares prices across every major platform so you never overpay for your
              college needs. Build a wishlist, browse the student marketplace, and save hundreds
              every semester.
            </p>

            <div className="max-w-2xl">
              <SearchBar onSearch={handleSearch} size="lg" />
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={() => navigate('marketplace')}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Marketplace
              </button>
              <button
                onClick={() => navigate('register')}
                className="flex items-center gap-2 text-slate-300 hover:text-white font-medium transition-colors"
              >
                Create free account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: '$2,400+', label: 'Avg. saved per student' },
              { value: '50,000+', label: 'Textbooks tracked' },
              { value: '12+', label: 'Price sources' },
              { value: '99%', label: 'Uptime guarantee' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-2xl sm:text-3xl font-extrabold">{value}</div>
                <div className="text-emerald-100 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Everything You Need to Save</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Frugal brings together the tools students need to make smarter purchasing decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Popular Textbooks</h2>
              <p className="text-slate-500 text-sm mt-1">Frequently searched by students</p>
            </div>
            <button
              onClick={() => navigate('search', { query: '', type: 'title' })}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {mockTextbooks.map((book) => (
              <BookCard key={book.productId} book={book} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Saving Today</h2>
          <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
            Create a free account to save your wishlist, compare prices, and access the student marketplace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('register')}
              className="w-full sm:w-auto px-8 py-3 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('search', { query: '', type: 'title' })}
              className="w-full sm:w-auto px-8 py-3 border border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Search Textbooks
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
