import { DollarSign, BookOpen, ShoppingBag, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { navigate } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Frugal</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your go-to platform for finding the best deals on textbooks and everyday essentials.
              Built for students, by students.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Features</h4>
            <ul className="space-y-2">
              {[
                { label: 'Search Textbooks', page: 'search' as const, icon: BookOpen },
                { label: 'Marketplace', page: 'marketplace' as const, icon: ShoppingBag },
                { label: 'My Wishlist', page: 'wishlist' as const, icon: Heart },
              ].map(({ label, page }) => (
                <li key={page}>
                  <button
                    onClick={() => navigate(page)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'Sign In', page: 'login' as const },
                { label: 'Create Account', page: 'register' as const },
                { label: 'Profile', page: 'profile' as const },
              ].map(({ label, page }) => (
                <li key={page}>
                  <button
                    onClick={() => navigate(page)}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Frugal. Built for IT 326 – Principles of Software Engineering.
          </p>
          <p className="text-xs text-slate-500">
            Andrew Kosy &middot; Caleb Appiah-Dankwah &middot; Clayton Kimber
          </p>
        </div>
      </div>
    </footer>
  );
}
