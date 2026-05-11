'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface GenerateInsightButtonProps {
  className?: string;
  compact?: boolean;
}

export function GenerateInsightButton({ className = '', compact = false }: GenerateInsightButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (res.status === 403) {
        toast.error('Free tier limit reached', {
          description: 'You\'ve used your 3 free insights this week. Upgrade for unlimited insights.',
          action: { label: 'Upgrade', onClick: () => router.push('/billing') },
        });
        return;
      }

      if (res.status === 422 && data.insufficient_data) {
        toast.info('Keep logging!', {
          description: data.error,
        });
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? 'Could not generate insight. Please try again.');
        return;
      }

      toast.success('New insight generated!', {
        description: data.data?.title,
        duration: 4000,
      });
      router.refresh();
    } catch {
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors disabled:opacity-50 ${className}`}
      >
        {isGenerating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        {isGenerating ? 'Analyzing...' : 'Generate insight'}
      </button>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={`flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing your data...
        </>
      ) : (
        <>
          <Brain className="w-4 h-4" />
          Generate AI insight
        </>
      )}
    </button>
  );
}
