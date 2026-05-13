'use client';

/**
 * AethLife — Bug Report & Rating System
 * Sends to ememzyvisuals@gmail.com via EmailJS REST API
 * No SDK needed — uses fetch directly.
 *
 * Setup:
 * 1. emailjs.com → create account → Add Service (Gmail)
 * 2. Create Email Template with these variables:
 *    {{from_name}}, {{from_email}}, {{bug_type}}, {{bug_title}},
 *    {{bug_description}}, {{rating}}, {{page_url}}, {{user_agent}}, {{screenshot}}
 * 3. Add to Vercel env vars:
 *    NEXT_PUBLIC_EMAILJS_SERVICE_ID
 *    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
 *    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
 */

import { useState, useRef } from 'react';
import {
  Bug, Star, X, Upload, Loader2, CheckCircle2,
  ChevronUp, MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'bug' | 'feature' | 'rating' | 'other';

const TYPES: { value: ReportType; label: string }[] = [
  { value: 'bug',     label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'rating',  label: 'Rate AethLife' },
  { value: 'other',   label: 'General Feedback' },
];

async function sendViaEmailJS(params: Record<string, string>) {
  const serviceId  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  // Debug: log which vars are missing so user can fix
  if (!serviceId || !templateId || !publicKey) {
    const missing = [
      !serviceId  && 'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
      !templateId && 'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
      !publicKey  && 'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
    ].filter(Boolean).join(', ');
    console.error('[AethLife] EmailJS missing env vars:', missing);
    console.error('[AethLife] NOTE: After adding env vars to Vercel, you MUST redeploy for them to take effect.');
    throw new Error(`EmailJS env vars missing: ${missing}`);
  }

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:      serviceId,
      template_id:     templateId,
      user_id:         publicKey,
      template_params: params,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('[AethLife] EmailJS API error:', res.status, errText);
    throw new Error(`EmailJS error ${res.status}: ${errText}`);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function BugReport({ userEmail }: { userEmail?: string }) {
  const [open, setOpen]           = useState(false);
  const [type, setType]           = useState<ReportType>('bug');
  const [title, setTitle]         = useState('');
  const [desc, setDesc]           = useState('');
  const [rating, setRating]       = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [screenshot, setScreenshot]  = useState<File | null>(null);
  const [submitting, setSubmitting]  = useState(false);
  const [done, setDone]           = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error('Please add a title'); return; }
    if (type === 'rating' && rating === 0) { toast.error('Please select a rating'); return; }

    setSubmitting(true);
    try {
      let screenshotData = 'No screenshot';
      if (screenshot) {
        screenshotData = await fileToBase64(screenshot);
      }

      await sendViaEmailJS({
        from_name:       userEmail ? userEmail.split('@')[0] : 'AethLife User',
        from_email:      userEmail ?? 'no-email@aethlife.vercel.app',
        to_email:        'ememzyvisuals@gmail.com',
        bug_type:        TYPES.find(t => t.value === type)?.label ?? type,
        bug_title:       title.trim(),
        bug_description: desc.trim() || 'No description provided.',
        rating:          type === 'rating' ? `${rating}/5 stars` : 'N/A',
        page_url:        typeof window !== 'undefined' ? window.location.href : 'Unknown',
        user_agent:      typeof window !== 'undefined' ? navigator.userAgent : 'Unknown',
        screenshot:      screenshotData,
      });

      setDone(true);
      setTimeout(() => {
        setDone(false);
        setOpen(false);
        setTitle(''); setDesc(''); setRating(0); setScreenshot(null); setType('bug');
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error('Feedback not sent. Open Vercel → Settings → Env Vars → confirm NEXT_PUBLIC_EMAILJS_* are set → redeploy.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-30 w-11 h-11 rounded-2xl gradient-teal text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        aria-label="Report a bug or leave feedback"
        title="Feedback"
      >
        <MessageSquare className="w-4.5 h-4.5" />
      </button>

      {/* ── Modal backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl shadow-black/40 overflow-hidden animate-slide-up"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl gradient-teal flex items-center justify-center">
                  <Bug className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Feedback
                  </h2>
                  <p className="text-[11px] text-muted-foreground">Goes directly to the developer</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Done state */}
            {done ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="font-semibold text-foreground" style={{ fontFamily: "'Clash Display', sans-serif" }}>Sent! Thank you</p>
                <p className="text-sm text-muted-foreground">The team will look into it shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Type selector */}
                <div className="flex gap-2 flex-wrap">
                  {TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                        type === t.value
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Star rating — only for 'rating' type */}
                {type === 'rating' && (
                  <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            s <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>
                    )}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Title *</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={
                      type === 'bug' ? 'What broke? e.g. "Expenses not saving"' :
                      type === 'feature' ? 'What would you like? e.g. "Dark mode calendar"' :
                      type === 'rating' ? 'Summarize your experience' :
                      'Your feedback in one line'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    maxLength={100}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Details (optional)</label>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Steps to reproduce, what you expected, what happened..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                    maxLength={1000}
                  />
                </div>

                {/* Screenshot upload */}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setScreenshot(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/40 rounded-xl px-4 py-2.5 w-full justify-center transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {screenshot ? screenshot.name : 'Attach screenshot (optional)'}
                  </button>
                  {screenshot && (
                    <button type="button" onClick={() => setScreenshot(null)} className="text-[11px] text-muted-foreground hover:text-red-500 mt-1 ml-1 transition-colors">
                      Remove
                    </button>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <>Send Feedback</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
