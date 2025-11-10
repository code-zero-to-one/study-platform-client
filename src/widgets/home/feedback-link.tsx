'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import Image from 'next/image';
import Link from 'next/link';

export default function FeedbackLink() {
  const handleClick = () => {
    sendGTMEvent({
      event: 'feedback_link_click',
      location: 'home_sidebar',
    });
  };

  return (
    <Link
      href={''}
      onClick={handleClick}
      className="bg-background-alternative rounded-100 flex items-center justify-between px-250 py-300"
    >
      <p className="flex flex-col items-start gap-50">
        <span className="font-designer-15b text-text-default">
          여러분의 의견이 궁금해요!
        </span>
        <span className="font-designer-12m text-text-subtlest">
          소중한 피드백을 기다리고 있어요
        </span>
      </p>

      <Image src="/feedback.svg" alt="피드백" width={86} height={56} />
    </Link>
  );
}
