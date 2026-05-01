'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToastStore } from '@/stores/use-toast-store';
import { BuilderDetailModal } from './builder-detail-modal';
import { CurriculumAccordion } from './curriculum-accordion';
import { MaterialIcon } from './material-icon';
import { MiniThumb } from './mini-site-thumbs';
import { OnboardingModal } from './onboarding-modal';
import { VIBE_COURSE } from '../_data/courses';
import { type FeedItem, FEED_ITEMS } from '../_data/feed-data';

const PRICE_WITH_CLAUDE = 39900;
const PRICE_WITHOUT_CLAUDE = 29900;
const BENEFITS_SUM_FULL = 117000;
const BENEFITS_SUM_LITE = 89000;

const FAQS = [
  {
    q: '코딩 한 번도 안 해봤는데 정말 괜찮나요?',
    a: '네, 이 코스는 코딩 경험이 0인 분을 기준으로 설계됐어요. 직접 코드를 외울 필요는 없고, AI(Claude)에게 잘 시키는 법을 익힙니다. 5일이면 첫 웹을 손에 쥡니다.',
  },
  {
    q: 'Claude Pro가 왜 필요한가요?',
    a: '바이브코딩의 핵심은 AI와 페어 프로그래밍하는 감각이에요. 이미 Claude를 쓰고 있거나 회사에서 지원받는 분은 「구독 미포함」 플랜으로 학습만 시작할 수 있어요. Pro가 필요하면 「포함」 플랜에서 1개월 이용권을 함께 받으실 수 있습니다.',
  },
  {
    q: '5일 안에 정말 배포까지 되나요?',
    a: '베타 수강생 127명 중 94%가 5일차에 배포까지 마쳤어요. 매일 한 챕터, 약 60~90분이면 충분합니다. 못 따라가도 괜찮아요 — 영구 수강이라 내 페이스로 끝낼 수 있어요.',
  },
  {
    q: '환불 정책이 어떻게 되나요?',
    a: 'CH 2 첫 화면 시작 전까지는 100% 환불해드려요. 충분히 둘러보고 결정해도 늦지 않습니다.',
  },
];

const BENEFITS = [
  {
    icon: 'school',
    title: '학습 콘텐츠',
    desc: '5일 · 10개 레슨 · 영구 수강',
    price: '₩59,000 상당',
  },
  {
    icon: 'auto_awesome',
    title: 'Claude Pro 1개월',
    desc: '바이브코딩의 핵심 도구',
    price: '₩28,000 상당',
  },
  {
    icon: 'forum',
    title: '질문 이용권 무제한',
    desc: '막히는 곳마다 물어보세요',
    price: '₩30,000 상당',
  },
];

const BENEFITS_WITHOUT_CLAUDE = BENEFITS.filter(
  (b) => b.icon !== 'auto_awesome',
);

type BenefitRow = (typeof BENEFITS)[number];

function ClassPricingPlanCard({
  eyebrow,
  title,
  subtitle,
  benefits,
  sumWas,
  sumNow,
  onPay,
  buttonLabel,
  highlighted,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  benefits: BenefitRow[];
  sumWas: number;
  sumNow: number;
  onPay: () => void;
  buttonLabel: string;
  highlighted?: boolean;
}) {
  const discountPercent = Math.round((1 - sumNow / sumWas) * 100);

  return (
    <div
      style={{
        background: highlighted
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.04)',
        border: highlighted
          ? '1px solid rgba(246,61,104,0.45)'
          : '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 420,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: '#FEA3B4',
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>{title}</div>
      <div
        style={{
          fontSize: 13,
          color: '#A4A7AE',
          marginTop: 8,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </div>
      <div
        style={{
          flex: 1,
          marginTop: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {benefits.map((b) => (
          <div
            key={b.title}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#F63D68',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MaterialIcon name={b.icon} size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{b.title}</div>
              <div
                style={{
                  fontSize: 13,
                  color: '#A4A7AE',
                  marginTop: 4,
                  lineHeight: 1.45,
                }}
              >
                {b.desc}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#FEA3B4',
                  marginTop: 8,
                  fontWeight: 600,
                }}
              >
                {b.price}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div style={{ fontSize: 13, color: '#A4A7AE' }}>
          합계 ₩{sumWas.toLocaleString()} →
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#FECDD6',
            letterSpacing: '-0.01em',
            marginTop: 8,
          }}
        >
          정가 대비 약 {discountPercent}% 할인
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#F63D68',
            letterSpacing: '-0.02em',
            marginTop: 6,
          }}
        >
          ₩{sumNow.toLocaleString()}
          <span
            style={{
              fontSize: 13,
              color: '#A4A7AE',
              fontWeight: 600,
              marginLeft: 10,
            }}
          >
            얼리버드 한정
          </span>
        </div>
      </div>
      <PrimaryButton
        size="xl"
        onClick={onPay}
        style={{
          marginTop: 18,
          width: '100%',
          justifyContent: 'center',
        }}
      >
        {buttonLabel}
        <MaterialIcon name="arrow_forward" size={18} />
      </PrimaryButton>
    </div>
  );
}

export function ClassDetailPage() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [openSample, setOpenSample] = useState<FeedItem | undefined>(undefined);
  const [sampleLiked, setSampleLiked] = useState<Record<number, boolean>>({});
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(false);

  const onPurchase = () => {
    setOnboardingOpen(true);
  };

  const onOnboardingComplete = () => {
    setOnboardingOpen(false);
    showToast('환영해요, 도현 빌더님! 🎉', 'success');
    router.push('/class/vibe-intro/roadmap');
  };

  const onOnboardingClose = () => {
    setOnboardingOpen(false);
  };

  const scrollToCurriculum = () => {
    document
      .getElementById('curriculum')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToBenefitsPurchase = () => {
    document
      .getElementById('class-benefits-purchase')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const samples = FEED_ITEMS.slice(0, 5);

  return (
    <div style={{ background: '#fff' }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FFE4E8 0%, #fff 60%)',
          padding: '72px 0 56px',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.05fr 1fr',
              gap: 64,
              alignItems: 'center',
            }}
          >
            {/* Left copy + CTA */}
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
                <PillBadge tone="brand">얼리버드 49% 할인</PillBadge>
                <PillBadge tone="neutral">D-3 마감</PillBadge>
              </div>
              <h1
                style={{
                  fontSize: 54,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  margin: 0,
                  color: '#181D27',
                }}
              >
                5일 후
                <br />
                당신이 배포하게 될
                <br />
                <span style={{ color: '#F63D68' }}>당신의 첫 웹.</span>
              </h1>
              <p
                style={{
                  fontSize: 17,
                  color: '#535862',
                  marginTop: 22,
                  lineHeight: 1.6,
                  maxWidth: 480,
                }}
              >
                코딩이 아니라 <b style={{ color: '#181D27' }}>완성</b>을
                가르칩니다. Cursor와 Claude로, 개발 초심자의 손에 만든 웹을
                쥐어드려요.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 14,
                  marginTop: 28,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: '#717680',
                    textDecoration: 'line-through',
                  }}
                >
                  ₩{VIBE_COURSE.originalPrice.toLocaleString()}
                </span>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'flex-end',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: '#F63D68',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    ₩{PRICE_WITHOUT_CLAUDE.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#717680',
                      letterSpacing: '0.02em',
                      lineHeight: 1,
                      paddingBottom: 4,
                      flexShrink: 0,
                    }}
                  >
                    최저가
                  </span>
                </div>
                <PillBadge tone="brand" small>
                  얼리버드
                </PillBadge>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <PrimaryButton
                  size="xl"
                  onClick={scrollToBenefitsPurchase}
                  style={{
                    boxShadow: '0 8px 24px -4px rgba(246,61,104,0.25)',
                  }}
                >
                  지금 시작하기
                  <MaterialIcon name="arrow_forward" size={18} />
                </PrimaryButton>
                <OutlineButton size="xl" onClick={scrollToCurriculum}>
                  커리큘럼 보기
                </OutlineButton>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginTop: 20,
                  fontSize: 13,
                  color: '#535862',
                }}
              >
                <MaterialIcon
                  name="verified"
                  size={18}
                  style={{ color: '#12B76A' }}
                />
                CH 2 시작 전 100% 환불 보장
              </div>
            </div>

            {/* Browser mockup */}
            <BrowserMockup />
          </div>
        </div>
      </section>

      {/* Sample carousel */}
      <section style={{ padding: '80px 0', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <PillBadge tone="brand">베타 수강생 결과물</PillBadge>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '14px 0 10px',
                color: '#181D27',
              }}
            >
              개발 초심자들이 5일 만에 만든 것들
            </h2>
            <p style={{ fontSize: 15, color: '#535862', margin: 0 }}>
              모두 코딩 경험이 0이었습니다. 그리고 모두 자기 URL을 가졌어요.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 14,
            }}
          >
            {samples.map((s) => (
              <SampleCard
                key={s.id}
                item={s}
                onClick={() => setOpenSample(s)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section
        id="curriculum"
        style={{ padding: '80px 0', background: '#fff' }}
      >
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <PillBadge tone="neutral">CURRICULUM</PillBadge>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '14px 0 10px',
                color: '#181D27',
              }}
            >
              5일, 5개의 챕터 · 10개 레슨
            </h2>
            <p style={{ fontSize: 15, color: '#535862', margin: 0 }}>
              학습 콘텐츠 열람 시간만 표기했어요 · 실습 시간은 별도예요.
              <br />
              <span style={{ color: '#E31B54', fontWeight: 600 }}>
                레슨 1·2는 결제 전에도 미리보기로 열어드려요.
              </span>
            </p>
          </div>
          <CurriculumAccordion />
        </div>
      </section>

      {/* Benefits stack */}
      <section
        id="class-benefits-purchase"
        style={{
          padding: '80px 0',
          background: '#181D27',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#FEA3B4',
              }}
            >
              BENEFITS
            </span>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '10px 0 0',
                color: '#fff',
              }}
            >
              플랜을 고르고 바로 시작해요
            </h2>
            <p
              style={{
                fontSize: 14,
                color: '#A4A7AE',
                margin: '12px 0 0',
                lineHeight: 1.55,
              }}
            >
              최저 ₩{PRICE_WITHOUT_CLAUDE.toLocaleString()}부터 · Claude Pro
              1개월은 필요할 때만 포함하세요
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            <ClassPricingPlanCard
              eyebrow="클로드 Pro 포함"
              title="올인원 플랜"
              subtitle="학습 + Claude Pro 1개월 + 무제한 질문"
              benefits={BENEFITS}
              sumWas={BENEFITS_SUM_FULL}
              sumNow={PRICE_WITH_CLAUDE}
              onPay={onPurchase}
              buttonLabel={`₩${PRICE_WITH_CLAUDE.toLocaleString()} · 결제하고 시작하기`}
              highlighted
            />
            <ClassPricingPlanCard
              eyebrow="클로드 구독 미포함"
              title="학습만 시작"
              subtitle="이미 Claude를 쓰거나 회사 지원이 있는 분께 추천"
              benefits={BENEFITS_WITHOUT_CLAUDE}
              sumWas={BENEFITS_SUM_LITE}
              sumNow={PRICE_WITHOUT_CLAUDE}
              onPay={onPurchase}
              buttonLabel={`₩${PRICE_WITHOUT_CLAUDE.toLocaleString()} · 결제하고 시작하기`}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <PillBadge tone="neutral">FAQ</PillBadge>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '14px 0 0',
                color: '#181D27',
              }}
            >
              자주 묻는 질문
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((f, i) => (
              <FaqItem
                key={f.q}
                q={f.q}
                a={f.a}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Refund policy strip */}
      <section style={{ padding: '36px 0', background: '#FFE4E8' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#F63D68',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MaterialIcon name="shield" size={26} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#181D27' }}>
                CH 2 시작 전까지 100% 환불 보장
              </div>
              <div style={{ fontSize: 13, color: '#C01048', marginTop: 4 }}>
                두 챕터를 둘러봤는데 안 맞으면, 한 줄 메시지면 바로 돌려드려요.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            padding: '0 48px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: 0,
              lineHeight: 1.15,
              color: '#181D27',
            }}
          >
            5일 뒤, 당신의 URL을
            <br />
            친구에게 보내고 있을 거예요.
          </h2>
          <p style={{ fontSize: 16, color: '#535862', marginTop: 18 }}>
            Claude 포함 ₩{PRICE_WITH_CLAUDE.toLocaleString()} · 미포함 ₩
            {PRICE_WITHOUT_CLAUDE.toLocaleString()}. 얼리버드는 D-3 마감이에요.
            늦으면 ₩{VIBE_COURSE.originalPrice.toLocaleString()}으로 돌아갑니다.
          </p>
          <PrimaryButton
            size="xl"
            onClick={scrollToBenefitsPurchase}
            style={{
              marginTop: 28,
              boxShadow: '0 8px 24px -4px rgba(246,61,104,0.25)',
              padding: '18px 36px',
              fontSize: 17,
            }}
          >
            플랜 선택하고 시작하기
            <MaterialIcon name="arrow_forward" size={20} />
          </PrimaryButton>
        </div>
      </section>

      <BuilderDetailModal
        item={openSample}
        onClose={() => setOpenSample(undefined)}
        liked={sampleLiked}
        onToggleLike={(id) =>
          setSampleLiked({ ...sampleLiked, [id]: !sampleLiked[id] })
        }
      />

      <OnboardingModal
        open={onboardingOpen}
        onClose={onOnboardingClose}
        onComplete={onOnboardingComplete}
      />
    </div>
  );
}

function BrowserMockup() {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 14,
          boxShadow:
            '0 24px 48px -16px rgba(16,24,40,0.18), 0 8px 16px -8px rgba(16,24,40,0.08)',
          border: '1px solid #E9EAEB',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 32,
            background: '#FAFAFA',
            borderBottom: '1px solid #E9EAEB',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#FF5F57',
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#FEBC2E',
            }}
          />
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#28C840',
            }}
          />
          <div
            style={{
              flex: 1,
              marginLeft: 14,
              height: 18,
              background: '#fff',
              border: '1px solid #E9EAEB',
              borderRadius: 6,
              fontSize: 11,
              color: '#717680',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
            }}
          >
            <MaterialIcon name="lock" size={11} style={{ marginRight: 6 }} />
            jiyun.vercel.app
          </div>
        </div>
        <div
          style={{
            padding: '32px 28px 36px',
            background: 'linear-gradient(180deg, #fff 0%, #FFE4E8 100%)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: '#E31B54',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            HELLO,
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#181D27',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginTop: 6,
            }}
          >
            저는 지윤메이커
            <br />
            입니다.
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#535862',
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            프로덕트 디자이너 / 5년차
            <br />
            AI 시대의 만드는 사람으로 자라는 중
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
            <span
              style={{
                background: '#F63D68',
                color: '#fff',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 4,
                fontWeight: 600,
              }}
            >
              포트폴리오 보기
            </span>
            <span
              style={{
                border: '1px solid #D5D7DA',
                color: '#252B37',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 4,
                fontWeight: 600,
                background: '#fff',
              }}
            >
              이메일 보내기
            </span>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: -14,
          right: -10,
          background: '#181D27',
          color: '#fff',
          padding: '8px 14px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          transform: 'rotate(6deg)',
          boxShadow:
            '0 4px 8px -2px rgba(16,24,40,0.10), 0 2px 4px -2px rgba(16,24,40,0.06)',
        }}
      >
        ✨ Day 5 결과물
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: -12,
          left: -8,
          background: '#F63D68',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          transform: 'rotate(-3deg)',
          boxShadow:
            '0 4px 8px -2px rgba(16,24,40,0.10), 0 2px 4px -2px rgba(16,24,40,0.06)',
        }}
      >
        실제 베타 수강생 결과물
      </div>
    </div>
  );
}

function SampleCard({
  item,
  onClick,
}: {
  item: FeedItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #E9EAEB',
        transition: 'transform .2s ease, box-shadow .2s ease',
        textAlign: 'left',
        padding: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow =
          '0 4px 8px -2px rgba(16,24,40,0.10), 0 2px 4px -2px rgba(16,24,40,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(16,24,40,0.05)';
      }}
    >
      <div
        style={{
          aspectRatio: '4/3',
          background: '#FAFAFA',
          borderBottom: '1px solid #F5F5F5',
          overflow: 'hidden',
        }}
      >
        <MiniThumb kind={item.thumbKind} />
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 11, color: '#717680' }}>{item.role}</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            marginTop: 2,
            color: '#181D27',
          }}
        >
          {item.title}
        </div>
      </div>
    </button>
  );
}

function FaqItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        border: '1px solid #E9EAEB',
        borderRadius: 12,
        overflow: 'hidden',
        background: isOpen ? '#FAFAFA' : '#fff',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '20px 24px',
          border: 0,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: '#181D27' }}>
          Q. {q}
        </span>
        <MaterialIcon
          name={isOpen ? 'remove' : 'add'}
          size={20}
          style={{ color: '#535862' }}
        />
      </button>
      {isOpen ? (
        <div
          style={{
            padding: '0 24px 22px',
            fontSize: 14,
            lineHeight: 1.7,
            color: '#252B37',
          }}
        >
          {a}
        </div>
      ) : null}
    </div>
  );
}

function PillBadge({
  tone,
  small,
  children,
}: {
  tone: 'brand' | 'neutral';
  small?: boolean;
  children: React.ReactNode;
}) {
  const palette =
    tone === 'brand'
      ? { bg: '#FFE4E8', color: '#C01048' }
      : { bg: '#F5F5F5', color: '#414651' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: small ? 11 : 12,
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: 999,
        letterSpacing: '-0.005em',
        background: palette.bg,
        color: palette.color,
      }}
    >
      {children}
    </span>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

function PrimaryButton({
  size = 'md',
  style,
  children,
  ...props
}: ButtonProps) {
  const padding =
    size === 'xl' ? '16px 28px' : size === 'lg' ? '13px 22px' : '10px 18px';
  const fontSize = size === 'xl' ? 16 : size === 'lg' ? 15 : 14;
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: '#F63D68',
        color: '#fff',
        border: 0,
        borderRadius: 4,
        padding,
        fontSize,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 150ms ease, transform 120ms ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#E31B54';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#F63D68';
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  size = 'md',
  style,
  children,
  ...props
}: ButtonProps) {
  const padding =
    size === 'xl' ? '16px 28px' : size === 'lg' ? '13px 22px' : '10px 18px';
  const fontSize = size === 'xl' ? 16 : size === 'lg' ? 15 : 14;
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: '#fff',
        color: '#181D27',
        border: '1px solid #D5D7DA',
        borderRadius: 4,
        padding,
        fontSize,
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 150ms ease, border-color 150ms ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#FAFAFA';
        e.currentTarget.style.borderColor = '#A4A7AE';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#fff';
        e.currentTarget.style.borderColor = '#D5D7DA';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
