'use client';

import { useEffect, useState } from 'react';

type Variant = 'A' | 'B';

/**
 * A/B 테스트 훅
 * 첫 방문 시 50:50 확률로 variant를 결정하고 localStorage에 저장하여
 * 같은 사용자는 항상 동일한 variant를 보게 합니다.
 */
export function useABTest(): Variant | null {
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const STORAGE_KEY = 'landing_ab_variant';

    // 이미 저장된 변형이 있는지 확인
    let savedVariant = localStorage.getItem(STORAGE_KEY) as Variant | null;

    if (savedVariant !== 'A' && savedVariant !== 'B') {
      // 없으면 랜덤으로 할당 (50:50)
      savedVariant = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(STORAGE_KEY, savedVariant);

      // 분석 이벤트 전송 (GTM/GA 등)
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'ab_test_assignment',
          variant: savedVariant,
        });
      }
    }

    setVariant(savedVariant);
  }, []);

  return variant;
}
