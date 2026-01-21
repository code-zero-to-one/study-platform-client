'use client';

import { useState, useEffect, useRef } from 'react';

interface CountingNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

export function CountingNumber({ value, duration = 2000, className }: CountingNumberProps) {
  const [count, setCount] = useState(0);
  const observerRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutQuart
      const easeOutQuart = (x: number): number => {
        return 1 - Math.pow(1 - x, 4);
      };
      
      const easedProgress = easeOutQuart(progress);
      const currentCount = Math.floor(easedProgress * value);
      
      setCount(currentCount);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, value, duration]);

  return (
    <span ref={observerRef} className={className}>
      {count.toLocaleString()}
    </span>
  );
}


