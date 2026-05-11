'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Bug, Star, Lightbulb, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const feedbackSchema = z.object({
  type: z.enum(['feedback', 'bug_report', 'feature_request', 'rating']),
  title: z.string().min(3, 'Title is required').max(200),
  description: z.string().min(10, 'Please provide more detail').max(2000),
  rating: z.number().min(1).max(5).optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const TYPES = [
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'bug_report', label: 'Bug Report', icon: Bug },
  { id: 'feature_request', label: 'Feature Request', icon: Lightbulb },
  { id: 'rating', label: 'Rating', icon: Star },
] as const;

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { type: 'feedback' },
  });

  const selectedType = watch('type');
  const selectedRating = watch('rating');

  async function onSubmit(data: FeedbackFormData) {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('feedback_reports').insert({
      user_id: user?.id ?? null,
      type: data.type,
      title: data.title,
      description: data.description,
      rating: data.type === 'rating' ? data.rating : null,
      email: data.email || user?.email || null,
      user_agent: navigator.userAgent,
    });

    if (error) {
      toast.error('Failed to submit feedback. Please try again.');
      return;
    }

    // Send email notification
    await fetch('/api/feedback/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: data.type, title: data.title, description: data.description }),
    });

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-teal-500" />
        </div>
        <h2 className="font-sans text-xl font-semibold text-foreground mb-2">Thank you!</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your feedback has been received and will be reviewed by the AethLife team.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-xl">
      <div className="page-header">
        <h1 className="page-title">Feedback & Support</h1>
        <p className="page-subtitle">Help us improve AethLife. All submissions go directly to our team.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Type selector */}
        <div className="aethlife-card">
          <p className="text-xs font-medium text-muted-foreground mb-3">What type of feedback?</p>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setValue('type', type.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  selectedType === type.id
                    ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-teal-500/30'
                }`}
              >
                <type.icon className="w-4 h-4 flex-shrink-0" />
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Star rating */}
        {selectedType === 'rating' && (
          <div className="aethlife-card">
            <p className="text-xs font-medium text-muted-foreground mb-3">Your rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue('rating', star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredStar || selectedRating || 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              {selectedRating && (
                <span className="text-sm text-muted-foreground ml-2">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][selectedRating]}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="aethlife-card space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title *</label>
            <input
              {...register('title')}
              placeholder="Brief summary..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description *</label>
            <textarea
              {...register('description')}
              placeholder={
                selectedType === 'bug_report'
                  ? 'Describe what happened, what you expected, and steps to reproduce...'
                  : selectedType === 'feature_request'
                  ? 'Describe the feature and why it would be useful...'
                  : 'Share your thoughts...'
              }
              rows={5}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Email (optional — for follow-up)
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="your@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Submit Feedback
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Submissions are reviewed by the AethLife team. Urgent issues can be emailed to{' '}
          <a href="mailto:info@aethlife.vercel.app" className="text-teal-500">info@aethlife.vercel.app</a>
        </p>
      </form>
    </div>
  );
}
