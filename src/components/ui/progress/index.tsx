'use client';

import * as RadixProgress from '@radix-ui/react-progress';
import * as React from 'react';

interface ProgressProps {
  value: number;
  indicatorColor: string;
}

const Progress: React.FC<ProgressProps> = ({ value, indicatorColor }) => {
  return (
    <RadixProgress.Root
      className="bg-background-accent-gray-subtle relative h-100 w-full overflow-hidden rounded-full"
      style={{ transform: 'translateZ(0)' }}
      value={value}
    >
      <RadixProgress.Indicator
        className={`h-full rounded-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${indicatorColor}`}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </RadixProgress.Root>
  );
};

export default Progress;
