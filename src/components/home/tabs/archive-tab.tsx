'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { 
  LibraryBig,
  LayoutGrid,
  List,
  ArrowUpDown,
  Bookmark,
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

type CurationLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

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
  isHidden?: boolean;
}

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

// ----------------------------------------------------------------------
// Components
// ----------------------------------------------------------------------

const LibraryCard = ({ 
  item, 
  onLike, 
  onView,
  onBookmark,
  onHide,
  isAdmin,
}: { 
  item: LibraryItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onHide?: (e: React.MouseEvent, id: number) => void;
  isAdmin?: boolean;
}) => {
  return (
    <div className={cn(
      "flex h-full flex-col gap-250 rounded-200 border border-border-subtle bg-background-default p-400 shadow-1 transition-all hover:-translate-y-50 hover:shadow-2",
      item.isHidden && "opacity-50"
    )}>
      <div className="flex items-start justify-between gap-200">
        <div className="flex flex-wrap items-center gap-100">
          {item.isHidden && (
            <span className="rounded-100 bg-fill-neutral-subtle-default px-200 py-50 font-designer-12m text-text-subtle">
              숨김됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-100">
          {isAdmin && onHide && (
            <button
              onClick={(e) => onHide(e, item.id)}
              className="flex items-center gap-50 rounded-100 px-150 py-50 font-designer-12m transition-colors bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover"
            >
              {item.isHidden ? '보이기' : '숨기기'}
            </button>
          )}
          <button
            onClick={(e) => onBookmark(e, item.id)}
            className="flex items-center gap-50 font-designer-12r hover:scale-110 transition-transform p-1 rounded-full hover:bg-fill-neutral-subtle-hover"
          >
            <Bookmark 
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                item.isBookmarked 
                  ? "fill-text-strong text-text-strong" 
                  : "text-text-subtle"
              )} 
            />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-150 mb-auto">
        <h3 className="font-bold-h5 text-text-strong line-clamp-2">
          {item.title}
        </h3>
        <p className="font-designer-13r text-text-subtle line-clamp-2">
          {item.description}
        </p>
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
  onHide,
  isAdmin,
}: { 
  item: LibraryItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onHide?: (e: React.MouseEvent, id: number) => void;
  isAdmin?: boolean;
}) => {
  return (
    <div 
      onClick={() => onView(item.link)}
      className={cn(
        "group flex items-center gap-300 px-300 py-200 border-b border-border-subtlest hover:bg-fill-neutral-subtle-hover transition-colors cursor-pointer last:border-0",
        item.isHidden && "opacity-50"
      )}
    >
      {/* Title Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-100">
        <div className="flex items-center gap-100">
          <h3 className="font-designer-15b text-text-strong group-hover:text-text-information truncate transition-colors">
            {item.title}
          </h3>
          {item.isHidden && (
            <span className="shrink-0 rounded-100 bg-fill-neutral-subtle-default px-150 py-25 font-designer-11m text-text-subtle">
              숨김됨
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
        {isAdmin && onHide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHide(e, item.id);
            }}
            className="flex items-center gap-25 rounded-100 px-100 py-50 font-designer-11m transition-colors bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover"
          >
            {item.isHidden ? '보이기' : '숨기기'}
          </button>
        )}
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className="flex items-center gap-50 font-designer-12r hover:scale-110 transition-transform p-1 rounded-full hover:bg-fill-neutral-subtle-hover"
        >
          <Bookmark 
            className={cn(
              "h-3.5 w-3.5 transition-colors",
              item.isBookmarked 
                ? "fill-text-strong text-text-strong" 
                : "text-text-subtle"
            )} 
          />
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

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function ArchiveTab() {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [librarySort, setLibrarySort] = useState<'LATEST' | 'VIEWS' | 'LIKES'>('LATEST');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New States
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Mock Admin Mode

  const ITEMS_PER_PAGE = viewMode === 'LIST' ? 15 : 10;

  // Data Loading Simulation
  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1);

    const timer = setTimeout(() => {
      setLibraryItems(MOCK_LIBRARY_DATA);
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

  const handleView = (link: string) => {
    window.open(link, '_blank');
  };

  const handleLibraryBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLibraryItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item,
      ),
    );
  };

  const handleHide = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLibraryItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isHidden: !item.isHidden } : item,
      ),
    );
  };

  // Filtering Logic
  const filteredLibrary = libraryItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBookmark = showBookmarkedOnly ? item.isBookmarked : true;
    const matchesHidden = isAdmin ? true : !item.isHidden;

    return matchesSearch && matchesBookmark && matchesHidden;
  });

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
        
        {/* Admin Toggle (Hidden/Dev feature) */}
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className={cn(
            "px-200 py-100 rounded-100 text-xs font-mono transition-colors",
            isAdmin ? "bg-red-100 text-red-600" : "bg-transparent text-transparent hover:text-gray-300"
          )}
        >
          {isAdmin ? 'Admin Mode ON' : 'Admin'}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-300">
          {/* Left Side Filters */}
          <div className="flex items-center gap-200 overflow-x-auto pb-100 md:pb-0 hide-scrollbar">
             {/* Bookmark Filter */}
             <button
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              className={cn(
                "flex items-center gap-50 px-300 py-150 rounded-100 border transition-all whitespace-nowrap font-designer-14b",
                showBookmarkedOnly
                  ? "bg-fill-brand-default-default border-transparent text-text-inverse shadow-1"
                  : "bg-background-default border-border-subtle text-text-subtle hover:border-border-brand hover:text-text-brand"
              )}
            >
              <Bookmark className={cn("w-4 h-4", showBookmarkedOnly && "fill-current")} />
              북마크
            </button>
          </div>
          
          {/* Right Side Controls */}
          <div className="flex flex-col md:flex-row gap-200 w-full md:w-auto items-start md:items-center ml-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-[240px]">
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
                  title="2열 보기"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('LIST')}
                  className={cn(
                    "p-100 rounded-75 transition-colors",
                    viewMode === 'LIST' ? "bg-fill-neutral-default-default text-text-strong shadow-sm" : "text-text-subtlest hover:text-text-subtle"
                  )}
                  title="1열 보기 (촘촘하게)"
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
                    onHide={handleHide}
                    isAdmin={isAdmin}
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
                      onHide={handleHide}
                      isAdmin={isAdmin}
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
