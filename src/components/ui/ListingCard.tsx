import { Tag, User, Calendar, CheckCircle, Trash2, BadgeCheck } from 'lucide-react';
import { SaleListing } from '../../types';
import { useApp } from '../../context/AppContext';

const conditionColors: Record<SaleListing['condition'], string> = {
  'new': 'bg-emerald-100 text-emerald-700',
  'like-new': 'bg-teal-100 text-teal-700',
  'good': 'bg-blue-100 text-blue-700',
  'fair': 'bg-amber-100 text-amber-700',
  'poor': 'bg-red-100 text-red-700',
};

const conditionLabel: Record<SaleListing['condition'], string> = {
  'new': 'New',
  'like-new': 'Like New',
  'good': 'Good',
  'fair': 'Fair',
  'poor': 'Poor',
};

interface ListingCardProps {
  listing: SaleListing;
  isOwner?: boolean;
  onContact?: () => void;
  onMarkSold?: () => void;
  onDelete?: () => void;
}

export default function ListingCard({ listing, isOwner, onContact, onMarkSold, onDelete }: ListingCardProps) {
  const { navigate } = useApp();
  const savings = listing.product.price - listing.price;
  const savingsPct = Math.round((savings / listing.product.price) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => navigate('book-detail', { book: listing.product })}
              className="text-sm font-semibold text-slate-800 hover:text-emerald-700 transition-colors line-clamp-2 text-left"
            >
              {listing.product.title}
            </button>
            <p className="text-xs text-slate-400 mt-0.5">
              {listing.product.author} &middot; {listing.product.edition}
            </p>
          </div>
          <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${conditionColors[listing.condition]}`}>
            {conditionLabel[listing.condition]}
          </span>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4">{listing.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-slate-900">${listing.price.toFixed(2)}</span>
          {savings > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 line-through">${listing.product.price.toFixed(2)}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                -{savingsPct}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {listing.sellerName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(listing.createdDate).toLocaleDateString()}
          </span>
        </div>

        {isOwner ? (
          <div className="flex gap-2">
            <button
              onClick={onMarkSold}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <BadgeCheck className="w-4 h-4" />
              Mark Sold
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-50 text-red-500 text-sm font-medium rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onContact}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Tag className="w-4 h-4" />
              Contact Seller
            </button>
            <button
              onClick={() => navigate('book-detail', { book: listing.product })}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-600 text-sm font-medium rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {listing.status === 'sold' && (
        <div className="bg-slate-100 px-5 py-2 text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sold</span>
        </div>
      )}
    </div>
  );
}
