'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { VibeIntroPaymentPending } from '@/components/pages/class/vibe-intro/payment/payment-pending';

function PendingContent() {
  const searchParams = useSearchParams();

  const bankName = searchParams.get('bankName') ?? '';
  const accountNumber = searchParams.get('accountNumber') ?? '';
  const dueDate = searchParams.get('dueDate') ?? '';
  const holderName = searchParams.get('holderName') ?? '';
  const amount = Number(searchParams.get('amount') ?? '0') || 0;

  return (
    <VibeIntroPaymentPending
      virtualAccount={{ bankName, accountNumber, dueDate, holderName, amount }}
    />
  );
}

export default function VibeIntroPaymentPendingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-500 w-500 animate-spin rounded-full border-4 border-background-brand-default border-t-transparent" />
        </div>
      }
    >
      <PendingContent />
    </Suspense>
  );
}
