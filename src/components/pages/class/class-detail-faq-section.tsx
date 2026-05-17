import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQS } from './class-detail-constants';

interface ClassDetailFaqSectionProps {
  expandedFaq: number | null;
  onToggleFaq: (idx: number) => void;
}

export function ClassDetailFaqSection({
  expandedFaq,
  onToggleFaq,
}: ClassDetailFaqSectionProps) {
  const items = FAQS;

  return (
    <section id="faq">
      <h2 className="font-designer-24b text-gray-800">궁금한 점 있으세요?</h2>
      <div className="mt-400 space-y-125">
        {items.map((faq, idx) => (
          <div
            key={faq.question}
            className="overflow-hidden rounded-200 border border-border-default bg-gray-100"
          >
            <button
              type="button"
              className="flex h-800 w-full items-center justify-between px-350"
              onClick={() => onToggleFaq(idx)}
            >
              <div className="flex items-center">
                <span className="mr-250 font-designer-16m text-text-brand">
                  Q
                </span>
                <span className="font-designer-16m text-gray-800">
                  {faq.question}
                </span>
              </div>
              {expandedFaq === idx ? (
                <ChevronUp className="h-300 w-300 shrink-0 text-gray-800" />
              ) : (
                <ChevronDown className="h-300 w-300 shrink-0 text-gray-800" />
              )}
            </button>
            {expandedFaq === idx && (
              <div className="flex items-start gap-250 border-t border-border-default px-350 py-300">
                <span className="font-designer-16m text-gray-500">A</span>
                <span className="font-designer-16r text-gray-800">
                  {faq.answer}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
