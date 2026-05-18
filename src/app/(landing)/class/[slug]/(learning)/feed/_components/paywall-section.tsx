import type { BuilderFeedPaywall } from '@/types/api/course.types';

export function PaywallSection({
  paywall,
  onCtaClick,
}: {
  paywall: BuilderFeedPaywall;
  onCtaClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-450 border-t border-border-subtle pt-800">
      <div className="flex flex-col items-center gap-150">
        <p className="font-designer-24b text-gray-1000">{paywall.title}</p>
        <p className="font-designer-16r text-center text-gray-800">
          {paywall.description}
        </p>
      </div>
      <button
        type="button"
        onClick={onCtaClick}
        className="flex h-700 w-3400 items-center justify-center rounded-100 bg-background-brand-default font-designer-18b text-text-inverse"
      >
        {paywall.ctaLabel}
      </button>
    </div>
  );
}
