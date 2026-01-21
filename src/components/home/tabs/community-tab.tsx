'use client';

import Link from 'next/link';
import { MessageSquareText, ExternalLink, Users, Calendar, TrendingUp } from 'lucide-react';

export default function CommunityTab() {
  return (
    <div className="flex flex-col gap-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
          위클리 소통 공간
          <MessageSquareText className="w-8 h-8 text-text-brand" />
        </h2>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-400">
        {/* 위클리 소통 공간 카드 */}
        <Link href="/insights/weekly" className="group">
          <div className="flex flex-col gap-300 rounded-200 border border-border-subtle bg-background-default p-500 shadow-1 transition-all hover:-translate-y-50 hover:shadow-3 hover:border-border-brand">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-200">
                <div className="w-[60px] h-[60px] rounded-200 bg-fill-brand-subtle-default flex items-center justify-center">
                  <MessageSquareText className="w-8 h-8 text-text-brand" />
                </div>
                <div className="flex flex-col gap-50">
                  <h3 className="font-bold-h4 text-text-strong group-hover:text-text-brand transition-colors">
                    위클리 소통 공간
                  </h3>
                  <span className="animate-pulse text-[12px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-150 py-50 rounded-full font-bold w-fit">
                    NEW
                  </span>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-text-subtle group-hover:text-text-brand transition-colors" />
            </div>

            <p className="font-designer-16r text-text-subtle leading-relaxed">
              매주 진행되는 커뮤니티 투표와 토론에 참여해보세요. 
              다른 멤버들과 소통하며 함께 성장할 수 있습니다.
            </p>

            <div className="flex items-center gap-300 pt-200 border-t border-border-subtle">
              <div className="flex items-center gap-100 text-text-subtle">
                <Users className="w-4 h-4" />
                <span className="font-designer-13m">활발한 커뮤니티</span>
              </div>
              <div className="flex items-center gap-100 text-text-subtle">
                <Calendar className="w-4 h-4" />
                <span className="font-designer-13m">매주 업데이트</span>
              </div>
            </div>
          </div>
        </Link>

        {/* 커뮤니티 통계 카드 */}
        <div className="flex flex-col gap-300 rounded-200 border border-border-subtle bg-background-default p-500 shadow-1">
          <div className="flex items-center gap-200">
            <div className="w-[60px] h-[60px] rounded-200 bg-fill-information-subtle-default flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-text-information" />
            </div>
            <div className="flex flex-col gap-50">
              <h3 className="font-bold-h4 text-text-strong">
                커뮤니티 현황
              </h3>
              <span className="font-designer-13r text-text-subtle">
                실시간 업데이트
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-300">
            <div className="flex flex-col gap-100 p-300 rounded-100 bg-fill-neutral-subtle-default">
              <span className="font-designer-12r text-text-subtle">이번 주 참여자</span>
              <span className="font-bold-h3 text-text-brand">127명</span>
            </div>
            <div className="flex flex-col gap-100 p-300 rounded-100 bg-fill-neutral-subtle-default">
              <span className="font-designer-12r text-text-subtle">진행 중인 투표</span>
              <span className="font-bold-h3 text-text-information">3개</span>
            </div>
            <div className="flex flex-col gap-100 p-300 rounded-100 bg-fill-neutral-subtle-default">
              <span className="font-designer-12r text-text-subtle">총 토론 주제</span>
              <span className="font-bold-h3 text-text-warning">24개</span>
            </div>
            <div className="flex flex-col gap-100 p-300 rounded-100 bg-fill-neutral-subtle-default">
              <span className="font-designer-12r text-text-subtle">활성 사용자</span>
              <span className="font-bold-h3 text-text-success">89%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 활동 섹션 */}
      <div className="flex flex-col gap-300">
        <h3 className="font-designer-18b text-text-strong">최근 커뮤니티 활동</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-300">
          {/* 최근 투표 */}
          <div className="flex flex-col gap-200 p-400 rounded-200 border border-border-subtle bg-background-default">
            <div className="flex items-center gap-150">
              <div className="w-[40px] h-[40px] rounded-100 bg-fill-brand-subtle-default flex items-center justify-center">
                <MessageSquareText className="w-5 h-5 text-text-brand" />
              </div>
              <div>
                <h4 className="font-designer-15b text-text-strong">최근 투표</h4>
                <span className="font-designer-12r text-text-subtle">2시간 전</span>
              </div>
            </div>
            <p className="font-designer-14r text-text-default">
              "다음 주 스터디 주제는 무엇이 좋을까요?"
            </p>
            <div className="flex items-center justify-between">
              <span className="font-designer-12r text-text-subtle">참여자 45명</span>
              <Link 
                href="/insights/weekly"
                className="font-designer-12b text-text-brand hover:text-text-information transition-colors"
              >
                참여하기 →
              </Link>
            </div>
          </div>

          {/* 인기 토론 */}
          <div className="flex flex-col gap-200 p-400 rounded-200 border border-border-subtle bg-background-default">
            <div className="flex items-center gap-150">
              <div className="w-[40px] h-[40px] rounded-100 bg-fill-warning-subtle-default flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-text-warning" />
              </div>
              <div>
                <h4 className="font-designer-15b text-text-strong">인기 토론</h4>
                <span className="font-designer-12r text-text-subtle">1일 전</span>
              </div>
            </div>
            <p className="font-designer-14r text-text-default">
              "개발자 취업 시장 전망과 준비 방법"
            </p>
            <div className="flex items-center justify-between">
              <span className="font-designer-12r text-text-subtle">댓글 23개</span>
              <Link 
                href="/insights/weekly"
                className="font-designer-12b text-text-brand hover:text-text-information transition-colors"
              >
                참여하기 →
              </Link>
            </div>
          </div>

          {/* 주간 하이라이트 */}
          <div className="flex flex-col gap-200 p-400 rounded-200 border border-border-subtle bg-background-default">
            <div className="flex items-center gap-150">
              <div className="w-[40px] h-[40px] rounded-100 bg-fill-success-subtle-default flex items-center justify-center">
                <Calendar className="w-5 h-5 text-text-success" />
              </div>
              <div>
                <h4 className="font-designer-15b text-text-strong">주간 하이라이트</h4>
                <span className="font-designer-12r text-text-subtle">3일 전</span>
              </div>
            </div>
            <p className="font-designer-14r text-text-default">
              "이번 주 베스트 학습 자료 모음"
            </p>
            <div className="flex items-center justify-between">
              <span className="font-designer-12r text-text-subtle">조회수 156회</span>
              <Link 
                href="/insights/weekly"
                className="font-designer-12b text-text-brand hover:text-text-information transition-colors"
              >
                보러가기 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA 섹션 */}
      <div className="flex flex-col items-center gap-300 p-600 rounded-200 bg-gradient-to-r from-fill-brand-subtle-default to-fill-information-subtle-default border border-border-brand">
        <div className="text-center">
          <h3 className="font-bold-h4 text-text-strong mb-100">
            지금 바로 커뮤니티에 참여해보세요!
          </h3>
          <p className="font-designer-16r text-text-subtle">
            다른 멤버들과 소통하며 함께 성장하는 경험을 만들어보세요.
          </p>
        </div>
        
        <Link href="/insights/weekly">
          <button className="flex items-center gap-150 px-400 py-200 bg-fill-brand-default-default text-text-inverse font-designer-16b rounded-100 hover:bg-fill-brand-strong-default transition-colors shadow-2">
            <MessageSquareText className="w-5 h-5" />
            위클리 소통 공간 입장하기
            <ExternalLink className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
