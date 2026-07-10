import { Loader2 } from 'lucide-react';

export const AFFILIATE_PAGE_CLASS = 'mx-auto max-w-6xl space-y-8 p-4 pb-10';

export function AffiliatePageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
    </div>
  );
}

export function AffiliatePageLoading({ message = 'Carregando…' }: { message?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
