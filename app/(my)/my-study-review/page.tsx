'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function MyStudyReview() {
  return (
    <>
      <section>
        <div className="mb-200">
          <div className="flex items-center gap-100">
            <div className="font-designer-20b text-text-default">받은 평가</div>
            <div className="font-designer-20b text-text-default">11</div>
          </div>

          <span className="font-designer-14r text-text-subtle">
            개선이 필요한 점은 나에게만 보여요
          </span>
        </div>

        <div className="mb-400 grid grid-cols-2 gap-300">
          <div className="rounded-100 border-border-subtle border p-200">
            <div className="mb-200 flex justify-between">
              <h3 className="font-designer-16b text-text-default">좋았던 점</h3>

              <button className="font-designer-12m text-text-subtlest cursor-pointer">
                더보기
              </button>
            </div>

            <ul className="flex flex-col gap-50">
              <KeywordReview type="positive" count={5} />
              <KeywordReview type="positive" count={5} />
              <KeywordReview type="positive" count={5} />
              <KeywordReview type="positive" count={5} />
              <KeywordReview type="positive" count={5} />
            </ul>
          </div>

          <div className="rounded-100 border-border-subtle border p-200">
            <div className="mb-200 flex justify-between">
              <h3 className="font-designer-16b text-text-default">
                개선이 필요한 점
              </h3>

              <button className="font-designer-12m text-text-subtlest cursor-pointer">
                더보기
              </button>
            </div>

            <ul className="flex flex-col gap-50">
              <KeywordReview type="negative" count={5} />
              <KeywordReview type="negative" count={5} />
              <KeywordReview type="negative" count={5} />
              <KeywordReview type="negative" count={5} />
              <KeywordReview type="negative" count={5} />
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-100">
          <div className="font-designer-20b text-text-default">후기</div>
          <div className="font-designer-20b text-text-default">11</div>
        </div>

        <span className="font-designer-14r text-text-subtle">
          모든 후기는 나에게만 보여요
        </span>

        <ul>
          <Review />
          <Review />
          <Review />
          <Review />
          <Review />
        </ul>
      </section>
    </>
  );
}

function KeywordReview({
  type,
  count,
}: {
  type: 'positive' | 'negative';
  count: number;
}) {
  return (
    <li className="bg-background-accent-gray-default text-text-default rounded-50 flex justify-between px-200 py-100">
      <span className="font-designer-14r">
        {type === 'positive' ? '“좋았어요, 괜찮았어요”' : '“아쉬웠어요”'} 평가
        키워드
      </span>
      <span className="font-designer-14b">{count}</span>
    </li>
  );
}

function Review() {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="flex flex-col gap-150 py-250">
      <div className="flex items-center gap-150">
        <Image
          src={'/profile-default.svg'}
          width={32}
          height={32}
          alt="프로필 이미지"
        />

        <div>
          <span className="font-designer-14b text-text-default mr-50">
            김코드
          </span>
          <span className="font-designer-14r text-text-subtle mr-50">·</span>
          <span className="font-designer-14r text-text-subtle">1시간 전</span>
        </div>
      </div>

      <div>
        <p
          className={`text-text-default font-designer-15r ${expanded ? 'line-clamp-none' : 'line-clamp-3'}`}
        >
          스터디에서 좋았어요~스터디에서 좋았어요~스터디에서 좋았어요~스터디에서
          좋았어요~스터디에서 좋았어요~스터디에서 좋았어요~스터디에서
          좋았어요~스터디에서 좋았어요~스터디에서 좋았어요~스터디에서
          좋았어요~스터디에서 좋았어요~스터디에서 좋았어요~스터디에서
          좋았어요~스터디에서 좋았어요~스터디에서 좋았어요~스터디에서
          좋았어요~스터디에서 좋았어요~스터디에서 좋았어요~스터디에서 좋았어요~
        </p>
        <button
          className="font-designer-14r text-text-subtlest cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '접기' : '더보기'}
        </button>
      </div>

      <div>
        <div className="text-text-subtle">
          <span className="font-designer-14b mr-100">스터디 기간</span>
          <span className="font-designer-13r">YYYY.MM.DD ~ YYYY.MM.DD</span>
        </div>
        <div className="text-text-subtle">
          <span className="font-designer-14b mr-100">스터디 주제</span>
          <span className="font-designer-13r">Back-end Deep Dive</span>
        </div>
      </div>
    </li>
  );
}
