import { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import * as api from '../lib/api';
import { useApp } from '../context/AppContext';
import { SaleListing, Textbook } from '../types';

interface ListingForm {
  isbn: string;
  title: string;
  author: string;
  edition: string;
  price: string;
  condition: string;
  description: string;
}

const conditions = [
  { value: 'new', label: 'New', desc: 'Never used, still in original packaging' },
  { value: 'like-new', label: 'Like New', desc: 'Barely used, no markings or damage' },
  { value: 'good', label: 'Good', desc: 'Some highlighting or wear, all pages intact' },
  { value: 'fair', label: 'Fair', desc: 'Noticeable wear, may have significant highlighting' },
  { value: 'poor', label: 'Poor', desc: 'Heavy wear, but all content readable' },
];

const emptyForm: ListingForm = {
  isbn: '', title: '', author: '', edition: '', price: '', condition: '', description: '',
};

export default function CreateListingPage() {
  const { navigate, isAuthenticated, pageParams } = useApp();
  const prefill = pageParams.book as Textbook | undefined;
  const [form, setForm] = useState<ListingForm>({
    ...emptyForm,
    isbn: prefill?.isbn ?? '',
    title: prefill?.title ?? '',
    author: prefill?.author ?? '',
    edition: prefill?.edition ?? '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <AlertCircle className="w-14 h-14 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Sign in to create a listing</h2>
        <button
          onClick={() => navigate('login')}
          className="mt-4 px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-9 h-9 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Listing Created!</h2>
        <p className="text-slate-500 mb-8">
          Your textbook listing for <span className="font-semibold">{form.title}</span> has been posted to the marketplace.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('marketplace')}
            className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          >
            View Marketplace
          </button>
          <button
            onClick={() => { setForm(emptyForm); setSubmitted(false); }}
            className="px-6 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:border-slate-300 transition-colors"
          >
            Post Another
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof ListingForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.isbn || !form.title || !form.author || !form.price || !form.condition) {
      setError('Please fill in all required fields.');
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    setLoading(true);
    try {
      const book: Textbook = prefill ?? {
        productId: crypto.randomUUID(),
        name: form.title,
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        edition: form.edition,
        publisher: '',
        description: '',
        price: 0,
        category: 'textbook',
        createdDate: new Date().toISOString().split('T')[0],
      };
      await api.createListing(book, price, form.condition as SaleListing['condition'], form.description);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-slate-800 placeholder-slate-400 text-sm transition-all';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('marketplace')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">Create Textbook Listing</h1>
      <p className="text-slate-500 text-sm mb-8">List your used textbook for other students to find and purchase.</p>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base">Book Information</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              ISBN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.isbn}
              onChange={handleChange('isbn')}
              placeholder="e.g. 978-0262046305"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="Enter the full book title"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.author}
                onChange={handleChange('author')}
                placeholder="Author name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Edition</label>
              <input
                type="text"
                value={form.edition}
                onChange={handleChange('edition')}
                placeholder="e.g. 4th Edition"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 text-base">Listing Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Asking Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={handleChange('price')}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {conditions.map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    form.condition === value
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={value}
                    checked={form.condition === value}
                    onChange={handleChange('condition')}
                    className="mt-0.5 accent-emerald-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Describe the book's condition, any highlighting, missing pages, etc."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Photos (optional)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-emerald-300 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Click to upload photos</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB each</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
}
