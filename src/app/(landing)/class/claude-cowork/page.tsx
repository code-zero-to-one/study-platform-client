import type { Metadata } from 'next';
import { CoworkBeforeAfterSection } from '@/components/class/cowork/cowork-before-after-section';
import { CoworkCurriculumSection } from '@/components/class/cowork/cowork-curriculum-section';
import { CoworkDifferenceSection } from '@/components/class/cowork/cowork-difference-section';
import { CoworkHeroSection } from '@/components/class/cowork/cowork-hero-section';
import { CoworkPainPointSection } from '@/components/class/cowork/cowork-pain-point-section';
import { CoworkQaSection } from '@/components/class/cowork/cowork-qa-section';
import { CoworkResultSection } from '@/components/class/cowork/cowork-result-section';
import { CoworkStickyCta } from '@/components/class/cowork/cowork-sticky-cta';

export const metadata: Metadata = {
  title: '코딩없이 AI한테 일 맡기는 방법 - 클로드 Cowork | ZERO-ONE',
  description:
    '매주 반복되는 보고서·회의록·데이터 정리, 이제 AI에게 맡기세요. Anthropic 공식 커리큘럼 기반 한국어 입문자 코스, Ch1까지 100% 무료.',
};

export default function ClaudeCoworkPage() {
  return (
    <div className="w-full pb-2500">
      <CoworkHeroSection />
      <CoworkPainPointSection />
      <CoworkBeforeAfterSection />
      <CoworkDifferenceSection />
      <CoworkCurriculumSection />
      <CoworkResultSection />
      <CoworkQaSection />
      <CoworkStickyCta />
    </div>
  );
}
