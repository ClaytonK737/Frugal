import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Page, User, Textbook, WishlistItem } from '../types';

interface AppContextValue {
  currentPage: Page;
  navigate: (page: Page, params?: Record<string, unknown>) => void;
  pageParams: Record<string, unknown>;
  user: User | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  wishlist: WishlistItem[];
  addToWishlist: (book: Textbook) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  favorites: Textbook[];
  toggleFavorite: (book: Textbook) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageParams, setPageParams] = useState<Record<string, unknown>>({});
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [favorites, setFavorites] = useState<Textbook[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUser({
            userId: firebaseUser.uid,
            firstName: data.firstName,
            lastName: data.lastName,
            email: firebaseUser.email ?? '',
            wishList: [],
          });
        }
        const wishlistSnap = await getDocs(
          collection(db, 'users', firebaseUser.uid, 'wishlist')
        );
        const items: WishlistItem[] = wishlistSnap.docs.map((d) => d.data() as WishlistItem);
        setWishlist(items);
      } else {
        setUser(null);
        setWishlist([]);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const navigate = (page: Page, params: Record<string, unknown> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    navigate('home');
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', firebaseUser.uid), { firstName, lastName, email });
    navigate('home');
  };

  const logout = async () => {
    await signOut(auth);
    setWishlist([]);
    setFavorites([]);
    navigate('home');
  };

  const addToWishlist = async (book: Textbook) => {
    const exists = wishlist.some((w) => w.book.productId === book.productId);
    if (exists || !user) return;
    const item: WishlistItem = { book, addedDate: new Date().toISOString().split('T')[0] };
    setWishlist((prev) => [...prev, item]);
    await setDoc(doc(db, 'users', user.userId, 'wishlist', book.productId), item);
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    setWishlist((prev) => prev.filter((w) => w.book.productId !== productId));
    await deleteDoc(doc(db, 'users', user.userId, 'wishlist', productId));
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
        authLoading,
        login,
        register,
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
