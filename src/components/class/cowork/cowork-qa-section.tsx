'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { FAQS } from './cowork-content';
import { CoworkSectionHeading } from './cowork-section-heading';

export function CoworkQaSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full bg-white px-300 py-1000 md:py-1500">
      <div className="mx-auto flex max-w-page flex-col items-center gap-600">
        <CoworkSectionHeading
          label="시작하기 전, 마지막으로 궁금한 점들"
          title="궁금한 점 있으세요?"
        />

        <div className="flex w-full flex-col gap-200">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-300 border border-gray-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-200 px-400 py-300 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-semibold text-gray-900 md:text-[17px]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-300 shrink-0 text-gray-400 transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="border-t border-gray-100 px-400 py-300 text-[14px] leading-[1.7] text-gray-600 md:text-[15px]">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
