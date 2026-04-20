import { createContext, useContext, useState, ReactNode } from 'react';
import { Page, User, Textbook, WishlistItem } from '../types';
import { mockWishlist } from '../data/mockData';

interface AppContextValue {
  currentPage: Page;
  navigate: (page: Page, params?: Record<string, unknown>) => void;
  pageParams: Record<string, unknown>;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, _password: string) => void;
  logout: () => void;
  wishlist: WishlistItem[];
  addToWishlist: (book: Textbook) => void;
  removeFromWishlist: (productId: string) => void;
  favorites: Textbook[];
  toggleFavorite: (book: Textbook) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageParams, setPageParams] = useState<Record<string, unknown>>({});
  const [user, setUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(mockWishlist);
  const [favorites, setFavorites] = useState<Textbook[]>([]);

  const navigate = (page: Page, params: Record<string, unknown> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const login = (email: string, _password: string) => {
    setUser({
      userId: 'u1',
      firstName: 'Alex',
      lastName: 'Johnson',
      email,
      wishList: [],
      savedMoney: 124.50,
    });
    navigate('home');
  };

  const logout = () => {
    setUser(null);
    navigate('home');
  };

  const addToWishlist = (book: Textbook) => {
    const exists = wishlist.some((w) => w.book.productId === book.productId);
    if (!exists) {
      setWishlist((prev) => [
        ...prev,
        { book, addedDate: new Date().toISOString().split('T')[0] },
      ]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((w) => w.book.productId !== productId));
  };

  const toggleFavorite = (book: Textbook) => {
    const exists = favorites.some((f) => f.productId === book.productId);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.productId !== book.productId));
    } else {
      setFavorites((prev) => [...prev, book]);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigate,
        pageParams,
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
