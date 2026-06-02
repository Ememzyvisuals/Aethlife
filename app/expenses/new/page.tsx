'use client';

import { useState, Suspense, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ScanLine,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  PenLine,
  Camera,
} from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { ExpenseCategory, ReceiptData } from '@/types';

// Fallback categories shown when Supabase returns empty
// (happens when RLS blocks global user_id=null rows)
const FALLBACK_CATEGORIES = [
  { id: 'fallback-food',     name: 'Food & Dining',    color: '#f59e0b', icon: 'utensils'    },
  { id: 'fallback-trans',    name: 'Transport',         color: '#3b82f6', icon: 'car'         },
  { id: 'fallback-shop',     name: 'Shopping',          color: '#8b5cf6', icon: 'shopping-bag'},
  { id: 'fallback-health',   name: 'Healthcare',        color: '#ef4444', icon: 'heart'       },
  { id: 'fallback-bills',    name: 'Bills & Utilities', color: '#f97316', icon: 'zap'         },
  { id: 'fallback-entertain',name: 'Entertainment',     color: '#14b8a6', icon: 'film'        },
  { id: 'fallback-edu',      name: 'Education',         color: '#6366f1', icon: 'book'        },
  { id: 'fallback-other',    name: 'Other',             color: '#94a3b8', icon: 'package'     },
] as const;


const expenseSchema = z.object({
  amount: z.number({ invalid_type_error: 'Enter a valid amount' }).positive('Amount must be greater than 0'),
  category_id: z.string().min(1, 'Please select a category'),
  description: z.string().min(1, 'Description is required').max(200),
  merchant: z.string().max(100).optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

type Mode = 'manual' | 'scan';

function NewExpenseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>((searchParams.get('mode') as Mode) ?? 'manual');
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [scannedData, setScannedData] = useState<ReceiptData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: format(new Date(), 'yyyy-MM-dd') },
  });

  // Set fallback categories immediately so form is never empty
  useEffect(() => {
    setCategories(FALLBACK_CATEGORIES as unknown as ExpenseCategory[]);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Try loading global + user categories
        const { data, error } = await supabase
          .from('expense_categories')
          .select('id, name, color, icon')
          .or(`user_id.is.null,user_id.eq.${user.id}`)
          .order('name');

        if (data && data.length > 0) {
          setCategories(data as ExpenseCategory[]);
        } else {
          // RLS may be blocking user_id=null rows — use built-in defaults
          // Run this SQL in Supabase to fix permanently:
          // ALTER POLICY "Users can view own categories" ON expense_categories
          //   USING (user_id IS NULL OR auth.uid() = user_id);
          console.warn('[AethLife] No categories from Supabase — using fallbacks. Error:', error?.message);
          setCategories(FALLBACK_CATEGORIES as unknown as ExpenseCategory[]);
        }
      } catch (err) {
        console.error('[AethLife] loadCategories error:', err);
        setCategories(FALLBACK_CATEGORIES as unknown as ExpenseCategory[]);
      }
    }
    loadCategories();
  }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setScanError(null);
    setIsScanning(true);

    try {
      // Compress image before sending to Groq
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const mimeType = compressed.type;

        const response = await fetch('/api/receipts/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          setScanError(result.error ?? 'Failed to scan receipt. Try manual entry.');
          setIsScanning(false);
          return;
        }

        const data: ReceiptData = result.data;
        setScannedData(data);

        // Pre-fill form with scanned data
        if (data.amount) setValue('amount', data.amount);
        if (data.merchant) setValue('merchant', data.merchant);
        if (data.date) setValue('date', data.date);
        if (data.merchant) setValue('description', `Purchase at ${data.merchant}`);

        // Auto-select category based on suggestion
        const suggestedCat = categories.find((c) =>
          c.name.toLowerCase().includes(data.category_suggestion.toLowerCase())
        );
        if (suggestedCat) setValue('category_id', suggestedCat.id);

        toast.success('Receipt scanned!', { description: 'Review and confirm the details below.' });
        setIsScanning(false);
        setMode('manual');
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      setScanError('Scanning failed. Please try again or enter manually.');
      setIsScanning(false);
    }
  }

  async function onSubmit(data: ExpenseFormData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data: profile } = await supabase.from('profiles').select('currency').eq('user_id', user.id).single();

    const { error } = await supabase.from('expenses').insert({
      user_id: user.id,
      category_id: data.category_id,
      amount: data.amount,
      currency: profile?.currency ?? 'NGN',
      description: data.description,
      merchant: data.merchant || null,
      date: data.date,
      notes: data.notes || null,
      ai_scanned: !!scannedData,
      receipt_data: scannedData ?? null,
    });

    if (error) {
      toast.error('Failed to save expense.');
      return;
    }

    toast.success('Expense saved!');
    router.push('/expenses');
  }

  return (
    <div className="animate-fade-in max-w-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">
          {scannedData ? 'Confirm Receipt' : 'Add Expense'}
        </h1>
        <button onClick={() => router.back()} className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode tabs */}
      <div className="flex items-center bg-muted rounded-xl p-1">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'manual' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <PenLine className="w-3.5 h-3.5" />
          Manual entry
        </button>
        <button
          onClick={() => setMode('scan')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'scan' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          Scan receipt
        </button>
      </div>

      {/* Scan mode */}
      {mode === 'scan' && (
        <div className="aethlife-card space-y-4">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              <p className="text-sm font-medium text-foreground">Analyzing receipt...</p>
              <p className="text-xs text-muted-foreground">AI is reading your receipt…</p>
            </div>
          ) : previewUrl ? (
            <div className="space-y-4">
              <img src={previewUrl} alt="Receipt preview" className="w-full max-h-64 object-contain rounded-xl border border-border" />
              {scanError ? (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{scanError}</p>
                </div>
              ) : null}
              <div className="flex gap-2">
                <button
                  onClick={() => { setPreviewUrl(null); setScanError(null); fileInputRef.current?.click(); }}
                  className="flex-1 border border-border hover:bg-muted text-foreground text-sm font-medium py-2.5 rounded-xl transition-all"
                >
                  Try another
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                >
                  Enter manually
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-teal-500/50 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all hover:bg-muted/30"
            >
              <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                <Camera className="w-7 h-7 text-teal-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Upload receipt photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP · Max 10MB</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-500">
                <ScanLine className="w-3.5 h-3.5" />
                Smart receipt scanning
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Manual / Confirm form */}
      {mode === 'manual' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {scannedData && (
            <div className="flex items-start gap-2 p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Receipt scanned successfully</p>
                <p className="text-xs text-muted-foreground">
                  Confidence: {Math.round((scannedData.confidence ?? 0.9) * 100)}% · Review and confirm below
                </p>
              </div>
            </div>
          )}

          <div className="aethlife-card space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all font-mono text-lg"
              />
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description *</label>
              <input
                {...register('description')}
                placeholder="What was this for?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category *</label>
              <select
                {...register('category_id')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id.message}</p>}
            </div>

            {/* Merchant & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Merchant</label>
                <input
                  {...register('merchant')}
                  placeholder="Store name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date *</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes</label>
              <textarea
                {...register('notes')}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Scanned items preview */}
          {scannedData?.items && scannedData.items.length > 0 && (
            <div className="aethlife-card">
              <p className="text-xs font-medium text-muted-foreground mb-3">Scanned line items</p>
              <div className="space-y-2">
                {scannedData.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-muted-foreground font-mono">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {scannedData ? 'Confirm & Save' : 'Save Expense'}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function NewExpensePage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-8 bg-muted rounded-xl w-48" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
      </div>
    }>
      <NewExpenseContent />
    </Suspense>
  );
}
