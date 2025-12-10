'use client';

import LandingVariantA from '@/components/landing/LandingVariantA';
import LandingVariantB from '@/components/landing/LandingVariantB';
import { useABTest } from '@/hooks/use-ab-test';

/**
 * 랜딩페이지 A/B 테스트 컨트롤러
 *
 * A안 (수치 중심): Hero -> Stats -> Reviews -> ...
 * B안 (리뷰 중심): Hero -> Reviews -> Stats -> ...
 *
 * 가설: "어떤 섹션을 먼저 보여줄 때 전환율이 높은가?"
 */
export default function LandingPage() {
  const variant = useABTest();

  // 첫 렌더링 시 variant가 null이므로 로딩 상태 표시
  if (variant === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="border-primary-default h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  // A/B 테스트에 따라 변형 렌더링
  return variant === 'A' ? <LandingVariantA /> : <LandingVariantB />;
}
