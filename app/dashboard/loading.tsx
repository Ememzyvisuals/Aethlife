import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="animate-pulse space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-muted rounded-xl w-32" />
          <div className="h-4 bg-muted rounded-lg w-48" />
        </div>
        <div className="h-10 bg-muted rounded-xl w-32" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
      </div>
      {[1,2,3,4].map(i => (
        <div key={i} className="h-20 bg-muted rounded-2xl" />
      ))}
    </div>
  );
}
