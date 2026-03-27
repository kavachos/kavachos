'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function RedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const target = token
      ? `/auth/verify-email?token=${encodeURIComponent(token)}`
      : '/auth/verify-email';
    router.replace(target);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-zinc-400 text-sm">Redirecting...</div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400 text-sm">Loading...</div>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}
