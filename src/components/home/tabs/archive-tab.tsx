'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { 
  LibraryBig,
  LayoutGrid,
  List,
  ArrowUpDown,
  Bookmark,
  Sparkles,
  Search,
  Eye,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ----------------------------------------------------------------------
// Types & Mock Data (Library)
// ----------------------------------------------------------------------

type CurationType = 'ARTICLE' | 'VIDEO' | 'PROBLEM' | 'REFERENCE';
type CurationLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type CurationBenefit = 'CONCEPT' | 'PRACTICE' | 'REVIEW';

interface LibraryItem {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  link: string;
  isLiked: boolean;
  level: CurationLevel;
  tags: string[];
  isBookmarked: boolean;
  isRecommended?: boolean;
}

interface CurationItem {
  id: number;
  title: string;
  description: string;
  type: CurationType;
  level: CurationLevel;
  tags: string[];
  benefit: CurationBenefit;
  link: string;
  isBookmarked: boolean;
  isRecommended?: boolean;
  author: string;
  views: number;
  likes: number;
  isLiked: boolean;
}

const CURATION_LABELS = {
  type: {
    ARTICLE: '글',
    VIDEO: '강의',
    PROBLEM: '문제',
    REFERENCE: '레퍼런스',
  },
  level: {
    BEGINNER: '초급',
    INTERMEDIATE: '중급',
    ADVANCED: '고급',
  },
  benefit: {
    CONCEPT: '개념 정리',
    PRACTICE: '실전 적용',
    REVIEW: '복습용',
  },
} as const;

const MOCK_LIBRARY_DATA: LibraryItem[] = [
  {
    id: 1,
    title: '2025년 상반기 백엔드 개발자 면접 질문 모음 (네카라쿠배)',
    description: '네이버, 카카오, 라인, 쿠팡, 배민 등 주요 기업의 실제 면접 질문을 분석했습니다.',
    author: '제로원 운영진',
    date: '2025.01.10',
    views: 1250,
    likes: 342,
    link: 'https://velog.io',
    isLiked: true,
    level: 'INTERMEDIATE',
    tags: ['면접', '백엔드', '취업'],
    isBookmarked: false,
    isRecommended: true,
  },
  {
    id: 2,
    title: '프론트엔드 성능 최적화: React 19 도입 가이드',
    description: '최신 React 19의 성능 개선 포인트와 마이그레이션 전략을 소개합니다.',
    author: 'TechLead_Kim',
    date: '2025.01.12',
    views: 890,
    likes: 120,
    link: 'https://medium.com',
    isLiked: false,
    level: 'ADVANCED',
    tags: ['React', '성능', '최적화'],
    isBookmarked: true,
  },
  {
    id: 3,
    title: '비전공자가 6개월 만에 개발자로 취업한 현실적인 공부법',
    description: '비전공 출신이 실제로 경험한 학습 로드맵과 포트폴리오 전략을 공유합니다.',
    author: 'NewDeveloper',
    date: '2025.01.05',
    views: 2100,
    likes: 560,
    link: 'https://brunch.co.kr',
    isLiked: true,
    level: 'BEGINNER',
    tags: ['비전공', '취업', '학습법'],
    isBookmarked: false,
    isRecommended: true,
  },
  {
    id: 4,
    title: 'CS 기초: 운영체제와 네트워크 핵심 요약 (PDF 다운로드)',
    description: '면접 대비를 위한 운영체제와 네트워크 핵심 개념 정리 자료입니다.',
    author: 'CS_Master',
    date: '2024.12.28',
    views: 1500,
    likes: 410,
    link: 'https://tistory.com',
    isLiked: false,
    level: 'INTERMEDIATE',
    tags: ['CS', '운영체제', '네트워크'],
    isBookmarked: false,
  },
  {
    id: 5,
    title: '주니어 개발자를 위한 이력서 첨삭 가이드 101',
    description: '합격하는 개발자 이력서 작성법과 실제 첨삭 사례를 소개합니다.',
    author: 'HR_Manager',
    date: '2025.01.15',
    views: 750,
    likes: 230,
    link: 'https://linkedin.com',
    isLiked: false,
    level: 'BEGINNER',
    tags: ['이력서', '취업', '포트폴리오'],
    isBookmarked: true,
  },
  ...Array.from({ length: 10 }, (_, i): LibraryItem => ({
    id: 10 + i,
    title: `개발자 면접 대비 - 자료구조 핵심 질문 ${i + 1}탄`,
    description: '자주 출제되는 자료구조 면접 질문과 모범 답변을 정리했습니다.',
    author: 'Admin',
    date: `2024.12.${20 - i}`,
    views: 100 + i * 10,
    likes: 10 + i,
    link: 'https://google.com',
    isLiked: Math.random() > 0.5,
    level: i % 3 === 0 ? 'BEGINNER' : i % 3 === 1 ? 'INTERMEDIATE' : 'ADVANCED',
    tags: ['면접', '자료구조', 'CS'],
    isBookmarked: Math.random() > 0.7,
  })),
];

const MOCK_CURATION_DATA: CurationItem[] = [
  {
    id: 101,
    title: 'Spring JPA 기본기, 실무에서 바로 쓰는 패턴',
    description: '기본 엔티티 설계부터 N+1 대응까지 핵심 패턴을 빠르게 정리합니다.',
    type: 'ARTICLE',
    level: 'INTERMEDIATE',
    tags: ['Spring', 'JPA', 'DB 설계'],
    benefit: 'PRACTICE',
    link: 'https://velog.io',
    isBookmarked: true,
    isRecommended: true,
    author: '제로원 운영진',
    views: 2340,
    likes: 580,
    isLiked: true,
  },
  {
    id: 102,
    title: 'React 성능 최적화 30분 요약',
    description: '렌더링 병목, 메모이제이션, 번들 최적화까지 압축 정리.',
    type: 'VIDEO',
    level: 'BEGINNER',
    tags: ['React', '성능', '최적화'],
    benefit: 'CONCEPT',
    link: 'https://youtube.com',
    isBookmarked: false,
    author: 'FrontendMaster',
    views: 1890,
    likes: 340,
    isLiked: false,
  },
  {
    id: 103,
    title: 'CS 면접 핵심 30제',
    description: '운영체제·네트워크·자료구조를 한 번에 복습하세요.',
    type: 'PROBLEM',
    level: 'INTERMEDIATE',
    tags: ['면접', 'CS', '자료구조'],
    benefit: 'REVIEW',
    link: 'https://notion.so',
    isBookmarked: false,
    author: 'CS_Master',
    views: 3200,
    likes: 720,
    isLiked: true,
  },
  {
    id: 104,
    title: '서비스 설계 레퍼런스 모음',
    description: '요구사항 정의부터 아키텍처 설계까지 참고할 수 있는 실무 모음.',
    type: 'REFERENCE',
    level: 'ADVANCED',
    tags: ['설계', '아키텍처', '문서화'],
    benefit: 'PRACTICE',
    link: 'https://medium.com',
    isBookmarked: false,
    author: 'TechLead_Kim',
    views: 1560,
    likes: 290,
    isLiked: false,
  },
];

// ----------------------------------------------------------------------
// Components
// ----------------------------------------------------------------------

const LibraryCard = ({ 
  item, 
  onLike, 
  onView,
  onBookmark,
  onSimilar,
}: { 
  item: LibraryItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onSimilar: (e: React.MouseEvent, tag: string) => void;
}) => {
  return (
    <div className="flex h-full flex-col gap-250 rounded-200 border border-border-subtle bg-background-default p-400 shadow-1 transition-all hover:-translate-y-50 hover:shadow-2">
      <div className="flex items-start justify-between gap-200">
        <div className="flex flex-wrap items-center gap-100">
          <span className="rounded-100 border border-border-subtle px-200 py-50 font-designer-12m text-text-subtle">
            {CURATION_LABELS.level[item.level]}
          </span>
          {item.isRecommended && (
            <span className="flex items-center gap-50 rounded-100 bg-fill-brand-subtle-default px-200 py-50 font-designer-12b text-text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              추천
            </span>
          )}
        </div>
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className={cn(
            'flex items-center gap-50 rounded-100 px-150 py-50 font-designer-12m transition-colors',
            item.isBookmarked
              ? 'bg-fill-neutral-strong-default text-text-inverse'
              : 'bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover',
          )}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {item.isBookmarked ? '저장됨' : '저장'}
        </button>
      </div>

      <div className="flex flex-col gap-150">
        <h3 className="font-bold-h5 text-text-strong line-clamp-2">
          {item.title}
        </h3>
        <p className="font-designer-13r text-text-subtle line-clamp-2">
          {item.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-100">
        {item.tags.map((tag) => (
          <button
            key={tag}
            onClick={(e) => onSimilar(e, tag)}
            className="rounded-100 bg-fill-neutral-subtle-default px-200 py-50 font-designer-12r text-text-subtle hover:bg-fill-neutral-subtle-hover"
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-300">
        <span className="font-designer-13m text-text-subtle">
          by <span className="text-text-default font-medium">{item.author}</span>
        </span>
        <div className="flex items-center gap-200 text-text-subtle">
          <div className="flex items-center gap-50 font-designer-12r">
            <Eye className="w-3.5 h-3.5" />
            {item.views.toLocaleString()}
          </div>
          <button 
            onClick={(e) => onLike(e, item.id)}
            className="flex items-center gap-50 font-designer-12r hover:scale-110 transition-transform p-1 rounded-full hover:bg-red-50"
          >
            <Heart 
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                item.isLiked ? "fill-red-500 text-red-500" : "text-text-subtle"
              )} 
            />
            <span className={cn(item.isLiked && "text-red-500 font-bold")}>
              {item.likes.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const LibraryRow = ({ 
  item, 
  onLike, 
  onView,
  onBookmark,
}: { 
  item: LibraryItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
}) => {
  return (
    <div 
      onClick={() => onView(item.link)}
      className="group flex items-center gap-300 px-300 py-200 border-b border-border-subtlest hover:bg-fill-neutral-subtle-hover transition-colors cursor-pointer last:border-0"
    >
      {/* Title Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-100">
        <div className="flex items-center gap-100">
          <h3 className="font-designer-15b text-text-strong group-hover:text-text-information truncate transition-colors">
            {item.title}
          </h3>
          <span className="shrink-0 rounded-100 border border-border-subtle px-150 py-25 font-designer-11m text-text-subtle">
            {CURATION_LABELS.level[item.level]}
          </span>
          {item.isRecommended && (
            <span className="shrink-0 flex items-center gap-25 rounded-100 bg-fill-brand-subtle-default px-150 py-25 font-designer-11b text-text-brand">
              <Sparkles className="h-3 w-3" />
              추천
            </span>
          )}
        </div>
        <div className="flex items-center gap-100 font-designer-12r text-text-subtle">
          <span>{item.author}</span>
          <span className="w-[1px] h-[10px] bg-border-subtle"></span>
          <span>{item.date}</span>
        </div>
      </div>

      {/* Stats Area */}
      <div className="flex items-center gap-200 shrink-0">
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className={cn(
            'flex items-center gap-25 rounded-100 px-100 py-50 font-designer-11m transition-colors',
            item.isBookmarked
              ? 'bg-fill-neutral-strong-default text-text-inverse'
              : 'bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover',
          )}
        >
          <Bookmark className="h-3 w-3" />
          {item.isBookmarked ? '저장됨' : '저장'}
        </button>
        
        <div className="flex items-center gap-50 font-designer-13m text-text-subtle min-w-[60px] justify-end">
          <Eye className="w-3.5 h-3.5" />
          {item.views.toLocaleString()}
        </div>
        
        <button 
          onClick={(e) => onLike(e, item.id)}
          className="flex items-center gap-50 font-designer-13m min-w-[50px] justify-end hover:scale-110 transition-transform p-1 rounded-full hover:bg-red-50"
        >
          <Heart 
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              item.isLiked ? "fill-red-500 text-red-500" : "text-text-subtle"
            )} 
          />
          <span className={cn(item.isLiked ? "text-red-500 font-bold" : "text-text-subtle")}>
            {item.likes.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
};

const CurationCard = ({
  item,
  onBookmark,
  onView,
  onSimilar,
  onLike,
}: {
  item: CurationItem;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onView: (e: React.MouseEvent, link: string) => void;
  onSimilar: (e: React.MouseEvent, tag: string) => void;
  onLike: (e: React.MouseEvent, id: number) => void;
}) => {
  return (
    <div className="flex h-full flex-col gap-250 rounded-200 border border-border-subtle bg-background-default p-400 shadow-1 transition-all hover:-translate-y-50 hover:shadow-2">
      <div className="flex items-start justify-between gap-200">
        <div className="flex flex-wrap items-center gap-100">
          <span className="rounded-100 border border-border-subtle px-200 py-50 font-designer-12m text-text-subtle">
            {CURATION_LABELS.level[item.level]}
          </span>
          {item.isRecommended && (
            <span className="flex items-center gap-50 rounded-100 bg-fill-brand-subtle-default px-200 py-50 font-designer-12b text-text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              추천
            </span>
          )}
        </div>
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className={cn(
            'flex items-center gap-50 rounded-100 px-150 py-50 font-designer-12m transition-colors',
            item.isBookmarked
              ? 'bg-fill-neutral-strong-default text-text-inverse'
              : 'bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover',
          )}
        >
          <Bookmark className="h-3.5 w-3.5" />
          {item.isBookmarked ? '저장됨' : '저장'}
        </button>
      </div>

      <div className="flex flex-col gap-150">
        <h3 className="font-bold-h5 text-text-strong line-clamp-2">
          {item.title}
        </h3>
        <p className="font-designer-13r text-text-subtle line-clamp-2">
          {item.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-100">
        {item.tags.map((tag) => (
          <button
            key={tag}
            onClick={(e) => onSimilar(e, tag)}
            className="rounded-100 bg-fill-neutral-subtle-default px-200 py-50 font-designer-12r text-text-subtle hover:bg-fill-neutral-subtle-hover"
          >
            #{tag}
          </button>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-300">
        <span className="font-designer-13m text-text-subtle">
          by <span className="text-text-default font-medium">{item.author}</span>
        </span>
        <div className="flex items-center gap-200 text-text-subtle">
          <div className="flex items-center gap-50 font-designer-12r">
            <Eye className="w-3.5 h-3.5" />
            {item.views.toLocaleString()}
          </div>
          <button 
            onClick={(e) => onLike(e, item.id)}
            className="flex items-center gap-50 font-designer-12r hover:scale-110 transition-transform p-1 rounded-full hover:bg-red-50"
          >
            <Heart 
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                item.isLiked ? "fill-red-500 text-red-500" : "text-text-subtle"
              )} 
            />
            <span className={cn(item.isLiked && "text-red-500 font-bold")}>
              {item.likes.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function ArchiveTab() {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [curationItems, setCurationItems] = useState<CurationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [librarySort, setLibrarySort] = useState<'LATEST' | 'VIEWS' | 'LIKES'>('LATEST');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const ITEMS_PER_PAGE = viewMode === 'LIST' ? 15 : 10;

  // Data Loading Simulation
  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1);

    const timer = setTimeout(() => {
      setLibraryItems(MOCK_LIBRARY_DATA);
      setCurationItems(MOCK_CURATION_DATA);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  // Handler for Likes
  const handleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLibraryItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1
        };
      }
      return item;
    }));
  };

  const handleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCurationItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item,
      ),
    );
  };

  const handleView = (link: string) => {
    window.open(link, '_blank');
  };

  const handleCurationView = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    handleView(link);
  };

  const handleSimilar = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setSearchTerm(tag);
    setCurrentPage(1);
  };

  const handleCurationLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setCurationItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            isLiked: !item.isLiked,
            likes: item.isLiked ? item.likes - 1 : item.likes + 1,
          };
        }
        return item;
      }),
    );
  };

  const handleLibraryBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLibraryItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item,
      ),
    );
  };

  // Filtering Logic
  const filteredLibrary = libraryItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedLibrary = [...filteredLibrary].sort((a, b) => {
    if (librarySort === 'VIEWS') return b.views - a.views;
    if (librarySort === 'LIKES') return b.likes - a.likes;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Pagination Logic
  const totalItems = sortedLibrary.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const currentLibrary = sortedLibrary.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-400">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
          제로원 아카이브
          <LibraryBig className="w-8 h-8 text-text-brand" />
        </h2>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-300">
          {/* Total Count */}
          <div className="font-designer-16m text-text-subtle whitespace-nowrap hidden md:block">
            총 <span className="font-bold text-text-strong">{totalItems}</span>개의 자료가 있습니다.
          </div>
          
          {/* Right Side Controls */}
          <div className="flex flex-col md:flex-row gap-200 w-full md:w-auto items-start md:items-center ml-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-[320px]">
              <input
                type="text"
                placeholder="제목, 내용으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-600 w-full rounded-100 border border-border-subtle bg-background-default pl-200 pr-500 font-designer-14m outline-none focus:border-border-default focus:ring-2 focus:ring-fill-neutral-default-default transition-all"
              />
              <span className="absolute right-200 top-1/2 -translate-y-1/2 text-text-subtlest">
                <Search className="w-4 h-4" />
              </span>
            </div>

            {/* Sort & View Toggle */}
            <div className="flex items-center gap-200 w-full md:w-auto justify-end">
              {/* Sort Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-50 px-200 py-150 rounded-100 bg-background-default border border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover transition-colors whitespace-nowrap">
                  <ArrowUpDown className="w-4 h-4" />
                  {librarySort === 'LATEST' ? '최신순' : librarySort === 'VIEWS' ? '조회순' : '좋아요순'}
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full right-0 pt-50 w-[120px] hidden group-hover:block z-20">
                  <div className="bg-background-default border border-border-subtle rounded-100 shadow-2 overflow-hidden">
                    <button onClick={() => setLibrarySort('LATEST')} className="w-full text-left px-200 py-150 hover:bg-fill-neutral-subtle-hover font-designer-14r transition-colors">최신순</button>
                    <button onClick={() => setLibrarySort('VIEWS')} className="w-full text-left px-200 py-150 hover:bg-fill-neutral-subtle-hover font-designer-14r transition-colors">조회순</button>
                    <button onClick={() => setLibrarySort('LIKES')} className="w-full text-left px-200 py-150 hover:bg-fill-neutral-subtle-hover font-designer-14r transition-colors">좋아요순</button>
                  </div>
                </div>
              </div>

              <div className="w-[1px] h-[24px] bg-border-subtle"></div>

              {/* View Mode Toggle */}
              <div className="flex bg-background-default rounded-100 border border-border-subtle p-50 shrink-0">
                <button 
                  onClick={() => setViewMode('GRID')}
                  className={cn(
                    "p-100 rounded-75 transition-colors",
                    viewMode === 'GRID' ? "bg-fill-neutral-default-default text-text-strong shadow-sm" : "text-text-subtlest hover:text-text-subtle"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('LIST')}
                  className={cn(
                    "p-100 rounded-75 transition-colors",
                    viewMode === 'LIST' ? "bg-fill-neutral-default-default text-text-strong shadow-sm" : "text-text-subtlest hover:text-text-subtle"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
          <Loader2 className="w-8 h-8 animate-spin" />
          <div className="font-designer-16m">데이터를 불러오는 중입니다...</div>
        </div>
      ) : (
        <>
          {/* Curation Section */}
          <div className="flex flex-col gap-250">
            <div className="flex items-center justify-between">
              <h3 className="font-designer-18b text-text-strong">
                자료 큐레이션
              </h3>
              <span className="flex items-center gap-100 font-designer-13m text-text-subtle">
                <Sparkles className="h-4 w-4 text-text-brand" />
                취향 맞춤 추천
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-300">
              {curationItems.map((item) => (
                <CurationCard
                  key={item.id}
                  item={item}
                  onBookmark={handleBookmark}
                  onView={handleCurationView}
                  onSimilar={handleSimilar}
                  onLike={handleCurationLike}
                />
              ))}
            </div>
          </div>

          {/* Library Content */}
          {viewMode === 'GRID' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-300">
              {currentLibrary.length > 0 ? (
                currentLibrary.map((item) => (
                  <LibraryCard 
                    key={item.id} 
                    item={item} 
                    onLike={handleLike}
                    onView={handleView}
                    onBookmark={handleLibraryBookmark}
                    onSimilar={handleSimilar}
                  />
                ))
              ) : (
                <div className="col-span-full py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
                  <Search className="w-10 h-10 opacity-20" />
                  <p className="font-designer-16m">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="bg-background-default rounded-200 border border-border-subtle overflow-hidden">
              {currentLibrary.length > 0 ? (
                <div className="divide-y divide-border-subtlest">
                  {currentLibrary.map((item) => (
                    <LibraryRow 
                      key={item.id} 
                      item={item} 
                      onLike={handleLike}
                      onView={handleView}
                      onBookmark={handleLibraryBookmark}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
                  <Search className="w-10 h-10 opacity-20" />
                  <p className="font-designer-16m">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-100 py-600">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-[40px] h-[40px] flex items-center justify-center border border-border-subtle rounded-[9999px] hover:bg-fill-neutral-subtle-hover disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-text-subtle"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="flex items-center justify-center px-300 h-[40px] font-designer-15m text-text-subtle bg-background-default border border-border-subtle rounded-[9999px]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-[40px] h-[40px] flex items-center justify-center border border-border-subtle rounded-[9999px] hover:bg-fill-neutral-subtle-hover disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-text-subtle"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
