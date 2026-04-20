import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import WishlistPage from './pages/WishlistPage';
import FavoritesPage from './pages/FavoritesPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import ProfilePage from './pages/ProfilePage';

function PageRouter() {
  const { currentPage } = useApp();

  const noShellPages = ['login', 'register'];
  const isShellPage = !noShellPages.includes(currentPage);

  if (!isShellPage) {
    return (
      <>
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'register' && <RegisterPage />}
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'search' && <SearchPage />}
        {currentPage === 'book-detail' && <BookDetailPage />}
        {currentPage === 'wishlist' && <WishlistPage />}
        {currentPage === 'favorites' && <FavoritesPage />}
        {currentPage === 'marketplace' && <MarketplacePage />}
        {currentPage === 'create-listing' && <CreateListingPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PageRouter />
    </AppProvider>
  );
}
