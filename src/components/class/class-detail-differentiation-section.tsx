import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Avatar from '@/components/common/ui/avatar';
import { RoleBadge } from './builder-feed-utils';
import { DIFF_COLUMNS, DIFF_ROWS, DIFF_STEPS } from './class-detail-constants';

// Figma 좌표(420×405 박스) → %
const STEP_PILL_POS = [
  'left-1/2 top-[17.3%] -translate-x-1/2', // 학습 (상단 중앙)
  'left-[77.3%] top-[53.8%] -translate-x-1/2', // 실습 (우하단)
  'left-[24.8%] top-[53.8%] -translate-x-1/2', // 피드백 (좌하단)
];

const STEP_BADGE_POS = [
  'left-[67.9%] top-[37.3%]', // STEP 01
  'left-[42.1%] top-[80.5%]', // STEP 02
  'left-[16.9%] top-[37.3%]', // STEP 03
];

function StepFlow() {
  return (
    <div className="relative aspect-[420/405] w-full">
      {/* 연결 곡선 */}
      <Image
        src="/class-detail/step01-line.svg"
        alt=""
        width={123}
        height={123}
        aria-hidden
        className="absolute left-1/2 top-[24.2%] h-[30.1%] w-[29%]"
      />
      <Image
        src="/class-detail/step02-line.svg"
        alt=""
        width={245}
        height={123}
        aria-hidden
        className="absolute left-[21%] top-[54.3%] h-[30.1%] w-[58.1%]"
      />
      <Image
        src="/class-detail/step03-line.svg"
        alt=""
        width={123}
        height={123}
        aria-hidden
        className="absolute left-[21%] top-[24.2%] h-[30.1%] w-[29%]"
      />

      {/* STEP 배지 */}
      {DIFF_STEPS.map((s, i) => (
        <span
          key={s.step}
          className={cn(
            'absolute whitespace-nowrap rounded-full px-100 py-25 text-[10px] font-medium text-white sm:px-125 sm:text-[12px]',
            s.badgeClass,
            STEP_BADGE_POS[i],
          )}
        >
          {s.step}
        </span>
      ))}

      {/* 단계 pill */}
      {DIFF_STEPS.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            'absolute flex flex-col items-center justify-center gap-25 whitespace-nowrap rounded-200 px-150 py-100 sm:px-200 sm:py-125',
            s.pillClass,
            s.textClass,
            STEP_PILL_POS[i],
          )}
        >
          <span className="text-[13px] font-bold sm:text-[16px]">
            {s.label}
          </span>
          <span className="text-[11px] font-medium sm:text-[14px]">
            {s.desc}
          </span>
        </div>
      ))}
    </div>
  );
}

function FeatureItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-150">
      <p className="font-designer-20b text-gray-800">{title}</p>
      {children}
    </div>
  );
}

function ImagePlaceholder({
  label,
  ratio,
  bgClass,
}: {
  label: string;
  ratio: string;
  bgClass: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden',
        ratio,
        bgClass,
      )}
    >
      <span className="font-designer-20b text-gray-800">{label}</span>
    </div>
  );
}

// Q&A 미리보기 카드 (Figma node 1352-10538 충실 재현)
function QnaPreviewCard() {
  return (
    <div className="flex aspect-[420/405] w-full flex-col gap-100 overflow-hidden rounded-200 border border-gray-200 bg-white p-150">
      {/* 상단 — 질문 제목 + 닫기 */}
      <div className="flex items-start justify-between gap-100">
        <p className="font-designer-10b text-gray-800">
          <span className="text-rose-500">Q.</span> 코딩이 에러가 났는데 어떤
          부분에서 났는지 모르겠어요.
        </p>
        <X className="size-200 shrink-0 text-gray-400" />
      </div>

      {/* 질문자 메타 */}
      <div className="flex items-center gap-50">
        <Avatar image="/profile-default.svg" size={16} />
        <span className="font-designer-10m text-gray-800">뭉다</span>
        <RoleBadge variant="BUILDER" />
        <span className="font-designer-10r text-gray-400">5월 30일</span>
        <span className="font-designer-10r text-gray-400">조회 30</span>
      </div>

      {/* 질문 본문 */}
      <div className="flex flex-col gap-75 rounded-150 border border-gray-200 p-125">
        <p className="font-designer-10r text-gray-800">
          코딩이 에러가 났는데 어떤 부분에서 났는지 모르겠어요. 도와주세요.
        </p>
        <div className="aspect-[16/9] w-full rounded-150 bg-gray-200" />
      </div>

      {/* 답변 */}
      <div className="flex flex-col gap-75 rounded-150 border border-gray-200 bg-gray-50 p-125">
        <div className="flex items-center gap-50">
          <span className="font-designer-10b text-rose-500">A.</span>
          <span className="font-designer-10m text-gray-800">답변</span>
        </div>
        <div className="flex items-center gap-50">
          <Avatar image="/profile-default.svg" size={16} />
          <span className="font-designer-10m text-gray-800">제로운영진</span>
          <RoleBadge variant="MANAGER" />
          <span className="font-designer-10r text-gray-400">5월 30일</span>
        </div>
        <p className="font-designer-10r text-gray-800">
          에러 메시지를 캡처해서 같이 올려주시면 어떤 부분에서 났는지 함께
          확인해 드릴게요!
        </p>
      </div>
    </div>
  );
}

export function ClassDetailDifferentiationSection() {
  return (
    <section id="differentiation" className="mt-1750">
      <h2 className="font-designer-28b text-gray-800">
        다른 경쟁사와 차별점은 무엇인가요?
      </h2>

      {/* 비교표 */}
      <div className="mt-600 overflow-x-auto">
        <table className="w-full min-w-7500 border-collapse text-center">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 px-300 py-250 text-left font-designer-18r text-gray-800">
                항목
              </th>
              {DIFF_COLUMNS.map((col, i) => (
                <th
                  key={col}
                  className={cn(
                    'px-300 py-250',
                    i === 0
                      ? 'border-2 border-rose-500 bg-rose-50 font-designer-18b text-rose-500'
                      : 'border border-gray-300 bg-gray-50 font-designer-18r text-gray-800',
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIFF_ROWS.map((row, i) => (
              <tr key={i}>
                <td className="border border-gray-300 bg-background-default px-300 py-250 text-left font-designer-18r text-gray-800">
                  {}
                </td>
                {row.values.map((ok, i) => (
                  <td
                    key={i}
                    className={cn(
                      'px-300 py-250',
                      i === 0
                        ? 'border-2 border-rose-500 bg-rose-50'
                        : 'border border-gray-300 bg-background-default',
                    )}
                  >
                    <div className="flex items-center justify-center">
                      {ok ? (
                        <Check className="size-300 text-rose-500" />
                      ) : (
                        <X className="size-300 text-gray-400" />
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4개 특징 (제목 + 이미지 박스) 2×2 */}
      <div className="mt-800 grid grid-cols-1 gap-x-250 gap-y-500 sm:grid-cols-2">
        <FeatureItem title="핵심 개념을 하나씩 Why 기반">
          <ImagePlaceholder
            label="커리큘럼 미리보기 이미지"
            ratio="aspect-[420/260]"
            bgClass="bg-gray-100"
          />
        </FeatureItem>
        <FeatureItem title="알림톡도 러닝메이트와 함께 공부하는 것처럼">
          <ImagePlaceholder
            label="알림톡 이미지화면"
            ratio="aspect-[420/260]"
            bgClass="bg-gray-100"
          />
        </FeatureItem>
        <FeatureItem title="이론-실습-피드백 순환 구조">
          <div className="flex aspect-[420/405] items-center justify-center overflow-hidden bg-gray-50">
            <StepFlow />
          </div>
        </FeatureItem>
        <FeatureItem title="양방향 피드백 및 소셜 네트워킹">
          <QnaPreviewCard />
        </FeatureItem>
      </div>
    </section>
  );
}
