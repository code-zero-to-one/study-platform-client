import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/button';
import { type MentorRegistrationGuardCardProps } from '@/types/mentoring/registration-view';

export default function MentorRegistrationGuardCard({
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
}: MentorRegistrationGuardCardProps) {
  return (
    <section className="rounded-200 border-border-subtle bg-background-default mx-auto max-w-[720px] border px-300 py-400 text-center">
      <div className="bg-background-accent-rose-subtle rounded-500 mx-auto mb-200 flex h-500 w-500 items-center justify-center">
        <ShieldCheck className="text-text-brand h-28 w-28" />
      </div>
      <h1 className="font-designer-24b text-text-strong mb-100">{title}</h1>
      <p className="font-designer-14r text-text-subtle mb-300">{description}</p>
      {ctaHref ? (
        <Link href={ctaHref}>
          <Button color="primary" size="large">
            {ctaLabel}
          </Button>
        </Link>
      ) : (
        <Button color="primary" size="large" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      )}
    </section>
  );
}
