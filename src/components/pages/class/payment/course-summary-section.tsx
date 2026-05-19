import Image from 'next/image';
import type { CoursePlanResponse } from '@/types/api/course.types';

const ALLOWED_IMAGE_HOSTS = new Set([
  'img1.kakaocdn.net',
  'lh3.googleusercontent.com',
  'test-api.zeroone.it.kr',
  'api.zeroone.it.kr',
  'www.zeroone.it.kr',
  'uploaded-files-qa.32cd2fa416bea795bf67cbf65411103b.r2.cloudflarestorage.com',
  'test-blog.zeroone.it.kr',
  'blog.zeroone.it.kr',
]);

function isAllowedHost(url: string): boolean {
  try {
    return ALLOWED_IMAGE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

interface CourseSummarySectionProps {
  plan: CoursePlanResponse;
  onChangePlan: () => void;
  slug: string;
  thumbnailUrl: string | null;
}

export function CourseSummarySection({
  plan,
  onChangePlan,
  slug,
  thumbnailUrl,
}: CourseSummarySectionProps) {
  return (
    <div className="rounded-200 border border-gray-300 bg-background-default px-500 py-400">
      <h2 className="mb-300 font-designer-18b text-gray-800">주문 정보</h2>

      <div className="flex items-start gap-300">
        {thumbnailUrl && isAllowedHost(thumbnailUrl) && (
          <div className="relative h-1250 w-2000 shrink-0 overflow-hidden rounded-100">
            <Image
              src={thumbnailUrl}
              alt="코스 썸네일"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-100">
          <div className="flex items-center gap-125">
            <span className="rounded-50 bg-background-brand-default px-125 py-50 font-designer-12b text-gray-0">
              Pro 플랜
            </span>
          </div>
          <p className="font-designer-16b text-gray-800">
            바이브 코딩 입문자 코스
          </p>
          <p className="font-designer-14m text-gray-500">{plan.name}</p>

          <div className="mt-50 flex items-center gap-100">
            <span className="font-designer-18b text-gray-800">
              {plan.discountPrice.toLocaleString()}원
            </span>
            {plan.regularPrice > plan.discountPrice && (
              <span className="font-designer-14m text-gray-400 line-through">
                {plan.regularPrice.toLocaleString()}원
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onChangePlan}
            className="mt-50 w-fit font-designer-14m text-text-brand underline underline-offset-2"
          >
            플랜 변경
          </button>
        </div>
      </div>
    </div>
  );
}
