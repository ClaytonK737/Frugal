import { ExternalLink, TrendingDown, XCircle } from 'lucide-react';
import { PriceComparison } from '../../types';

interface PriceComparisonTableProps {
  comparisons: PriceComparison[];
  listPrice: number;
}

const formatLabels: Record<PriceComparison['format'], { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-emerald-100 text-emerald-700' },
  used: { label: 'Used', color: 'bg-blue-100 text-blue-700' },
  rental: { label: 'Rental', color: 'bg-amber-100 text-amber-700' },
  digital: { label: 'Digital', color: 'bg-slate-100 text-slate-600' },
};

export default function PriceComparisonTable({
  comparisons,
  listPrice,
}: PriceComparisonTableProps) {
  const sorted = [...comparisons].sort((a, b) => a.price - b.price);
  const lowest = sorted[0]?.price ?? listPrice;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Price Comparison</h3>
        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
          <TrendingDown className="w-4 h-4" />
          Best: ${lowest.toFixed(2)}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {sorted.map((item, i) => {
          const savings = listPrice - item.price;
          const savingsPct = Math.round((savings / listPrice) * 100);
          const fmt = formatLabels[item.format];

          return (
            <div
              key={i}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${
                i === 0 ? 'bg-emerald-50' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-slate-800 text-sm">{item.platform}</span>
                  {i === 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                      Best Deal
                    </span>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fmt.color}`}>
                  {fmt.label}
                </span>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-900">${item.price.toFixed(2)}</div>
                {savingsPct > 0 && (
                  <div className="text-xs text-emerald-600 font-medium">
                    Save {savingsPct}%
                  </div>
                )}
              </div>

              <div className="w-20 text-right">
                {item.inStock ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    View
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <XCircle className="w-3 h-3" />
                    Out of stock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
