'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { type ReactNode, useState } from 'react';
import UserAvatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import TableList from '@/components/ui/table';
import { getStatusBadge } from '@/features/study/interview/ui/status-badge-map';
import {
  type DailyStudy,
  type GetDailyStudiesResponse,
} from '@/features/study/one-to-one/schedule/api/schedule-types';
import { useDailyStudiesQuery } from '@/features/study/one-to-one/schedule/model/use-schedule-query';
import LinkIcon from 'public/icons/Link.svg';

const TABLE_HEADERS = [
  '조',
  '지원자',
  '면접관',
  '면접 주제',
  '피드백',
  '진행 상태',
  '참고 자료',
] as const;
type Header = (typeof TABLE_HEADERS)[number];

const TEXT = {
  sectionTitle: '오늘의 스터디 리스트',
  loading: '로딩 중...',
  error: '에러 발생',
  previous: '이전',
  next: '다음',
} as const;

const PAGE_SIZE = 10;
const INITIAL_CURSOR = 0;

function mapDailyStudyToDisplayData(
  row: DailyStudy,
): Record<Header, ReactNode> {
  return {
    조: row.groupNum ?? '-',
    지원자: (
      <div className="flex items-center gap-150 px-100 py-50">
        <UserAvatar image={row.intervieweeImage} />
        <span className="font-designer-14m whitespace-nowrap">
          {row.interviewee}
        </span>
      </div>
    ),
    면접관: (
      <div className="flex items-center gap-150 px-100 py-50">
        <UserAvatar image={row.interviewerImage} />
        <span className="font-designer-14m whitespace-nowrap">
          {row.interviewer}
        </span>
      </div>
    ),
    '면접 주제': row.subject || '-',
    피드백: row.feedback || '-',
    '진행 상태': getStatusBadge(row.progressStatus),
    '참고 자료': row.link ? (
      <a
        href={row.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          sendGTMEvent({
            event: 'study_reference_link_click',
            study_date: row.studyDate || '',
            interviewee: row.interviewee,
            location: 'home',
          });
        }}
      >
        <LinkIcon className="h-4 w-4" />
      </a>
    ) : (
      <LinkIcon color="gray" className="h-4 w-4" />
    ),
  };
}

function MockStudyListSection() {
  const displayData: Record<Header, ReactNode>[] = [
    {
      조: 1,
      지원자: (
        <div className="flex items-center gap-150 px-100 py-50">
          <UserAvatar image="" />
          <span className="font-designer-14m whitespace-nowrap">지원자</span>
        </div>
      ),
      면접관: (
        <div className="flex items-center gap-150 px-100 py-50">
          <UserAvatar image="" />
          <span className="font-designer-14m whitespace-nowrap">면접관</span>
        </div>
      ),
      '면접 주제': '네트워크 기초',
      피드백: '-',
      '진행 상태': getStatusBadge('IN_PROGRESS'),
      '참고 자료': <LinkIcon className="h-4 w-4" />,
    },
  ];

  return (
    <section className="w-full">
      <h3 className="font-bold-h5 pb-150">{TEXT.sectionTitle}</h3>
      <TableList headers={TABLE_HEADERS} data={displayData} />
    </section>
  );
}

interface StudyListPaginationControlsProps {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFetching: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

function StudyListPaginationControls({
  hasNextPage,
  hasPreviousPage,
  isFetching,
  onNextPage,
  onPreviousPage,
}: StudyListPaginationControlsProps) {
  if (!hasPreviousPage && !hasNextPage) {
    return null;
  }

  return (
    <div className="border-border-subtle mt-200 flex justify-end border-t pt-200">
      <div className="flex items-center gap-100">
        <Button
          color="outlined"
          size="small"
          type="button"
          disabled={!hasPreviousPage || isFetching}
          onClick={onPreviousPage}
        >
          {TEXT.previous}
        </Button>
        <Button
          color="outlined"
          size="small"
          type="button"
          disabled={!hasNextPage || isFetching}
          onClick={onNextPage}
        >
          {TEXT.next}
        </Button>
      </div>
    </div>
  );
}

const createNextPageCursors = ({
  currentPage,
  nextCursor,
  previousCursors,
}: {
  currentPage: number;
  nextCursor: GetDailyStudiesResponse['nextCursor'];
  previousCursors: number[];
}) => {
  const nextCursors = [...previousCursors];
  nextCursors[currentPage] = nextCursor;

  return nextCursors;
};

function useStudyListSection(studyDate: string) {
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<number[]>([INITIAL_CURSOR]);
  const currentCursor = pageCursors[page - 1] ?? INITIAL_CURSOR;

  const { data, isFetching, isLoading, error } = useDailyStudiesQuery({
    cursor: currentCursor,
    pageSize: PAGE_SIZE,
    studyDate,
  });

  const hasPreviousPage = page > 1;
  const hasNextPage = data?.hasNext ?? false;
  const displayData: Record<Header, ReactNode>[] =
    data?.items.map(mapDailyStudyToDisplayData) ?? [];

  const goToPreviousPage = () => {
    if (!hasPreviousPage || isFetching) {
      return;
    }

    setPage((currentPage) => Math.max(currentPage - 1, 1));
  };

  const goToNextPage = () => {
    if (!hasNextPage || isFetching || !data) {
      return;
    }

    setPageCursors((previousCursors) => {
      return createNextPageCursors({
        currentPage: page,
        nextCursor: data.nextCursor,
        previousCursors,
      });
    });

    setPage((currentPage) => currentPage + 1);
  };

  return {
    state: {
      data,
      error,
      isFetching,
      isLoading,
    },
    viewModel: {
      displayData,
      hasNextPage,
      hasPreviousPage,
    },
    actions: {
      goToNextPage,
      goToPreviousPage,
    },
  };
}

function RealStudyListSection({ studyDate }: { studyDate: string }) {
  const { state, viewModel, actions } = useStudyListSection(studyDate);

  if (state.isLoading && !state.data) return <div>{TEXT.loading}</div>;
  if (state.error && !state.data) return <div>{TEXT.error}</div>;
  if (!state.data) return null;

  return (
    <section className="w-full">
      <h3 className="font-bold-h5 pb-150">{TEXT.sectionTitle}</h3>
      <TableList headers={TABLE_HEADERS} data={viewModel.displayData} />
      <StudyListPaginationControls
        hasNextPage={viewModel.hasNextPage}
        hasPreviousPage={viewModel.hasPreviousPage}
        isFetching={state.isFetching}
        onNextPage={actions.goToNextPage}
        onPreviousPage={actions.goToPreviousPage}
      />
    </section>
  );
}

export default function StudyListSection({
  studyDate,
  tutorialMode,
}: {
  studyDate: string;
  tutorialMode?: boolean;
}) {
  return tutorialMode ? (
    <MockStudyListSection />
  ) : (
    <RealStudyListSection key={studyDate} studyDate={studyDate} />
  );
}
