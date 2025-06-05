'use client';

// import { useDailyStudiesQuery } from '@/features/study/model/use-study-query';

const mockData: DailyStudy[] = [
   {
      interviewer: "이민수",
      interviewee: "김지원",
      subject: "TCP 3-way handshake란?",
      feedBack: "3-way handshake 설명이 정확하고 실습 경험도 잘 어필함",
      progressStatus: "COMPLETE",
      link: "https://example.com/tcp-study",
   },
   {
      interviewer: "정은지",
      interviewee: "박현우",
      subject: "운영체제의 스케줄링 기법",
      feedBack: null,
      progressStatus: "IN_PROGRESS",
      link: "",
   },
   {
      interviewer: "김지현",
      interviewee: "오세훈",
      subject: "트리 자료구조의 특징과 활용",
      feedBack: "구현 경험이 부족하다고 느껴짐. 연습 필요.",
      progressStatus: "PENDING",
      link: "https://example.com/tree-summary",
   },
   {
      interviewer: "서유진",
      interviewee: "최영재",
      subject: "트랜잭션이란 무엇일까?",
      feedBack: null,
      progressStatus: "ABSENT",
      link: "",
   },
   {
      interviewer: "이준석",
      interviewee: "박소연",
      subject: "캐시 메모리는 왜 중요한가?",
      feedBack: "L1/L2/L3 캐시 차이 설명이 명확함",
      progressStatus: "COMPLETE",
      link: "https://example.com/cache-deepdive",
   },
   {
      interviewer: "한지민",
      interviewee: "강하늘",
      subject: "메모리 관리 - 페이징과 세그멘테이션",
      feedBack: "페이지 교체 알고리즘에 대한 이해도 높음",
      progressStatus: "IN_PROGRESS",
      link: "https://example.com/memory-management",
   },
   {
      interviewer: "김태희",
      interviewee: "이도현",
      subject: "DFS와 BFS의 차이점은?",
      feedBack: null,
      progressStatus: "BEFORE_PROGRESSED",
      link: "",
   },
   {
      interviewer: "유재석",
      interviewee: "정해인",
      subject: "HTTP와 HTTPS의 차이",
      feedBack: "SSL/TLS 흐름을 도식화하며 설명한 점 인상 깊음",
      progressStatus: "COMPLETE",
      link: "https://example.com/http-vs-https",
   },
   {
      interviewer: "강호동",
      interviewee: "장원영",
      subject: "해시테이블은 왜 필요할까?",
      feedBack: "해시 충돌 해결 방식에 대한 설명 부족",
      progressStatus: "PENDING",
      link: "",
   },
   {
      interviewer: "박보검",
      interviewee: "김세정",
      subject: "머신러닝 개념 정리와 실제 사례",
      feedBack: "지도학습과 비지도학습 예시를 잘 들어줌",
      progressStatus: "COMPLETE",
      link: "https://example.com/ml-overview",
   },
];



import UserAvatar from '@/shared/ui/avatar';
import { Badge } from "@/shared/ui/badge/index";
import TableList from "@/shared/ui/table";
import LinkIcon from "public/icons/Link.svg";
import { DailyStudy, StudyProgressStatus } from '../api/types';

const headers = ["조", "지원자", "면접관", "면접 주제", "피드백", "진행 상태", "참고 자료"] as const;
type Header = (typeof headers)[number];

const statusBadgeMap: Partial<Record<StudyProgressStatus, React.ReactNode>> = {
   BEFORE_PROGRESSED: <Badge color="default">시작전</Badge>,
   PENDING: <Badge color="incomplete">보류</Badge>,
   IN_PROGRESS: <Badge color="incomplete">진행중</Badge>,
   COMPLETE: <Badge color="completed">완료</Badge>,
   ABSENT: <Badge color="incomplete">불참</Badge>,
};

function getImageIdFromName(name: string) {
   // 예시: 유니코드 합을 기반으로 ID 생성 (1~1084 범위 Picsum ID 사용)
   const codeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);

   return (codeSum % 1000) + 1; // 1 ~ 1000 사이로 제한
}

function mapDailyStudyToDisplayData(row: DailyStudy, index: number): Record<Header, React.ReactNode> {
   const interviewee = { name: row.interviewee, img: `https://picsum.photos/id/${getImageIdFromName(row.interviewee)}/40/40` };
   const interviewer = { name: row.interviewer, img: `https://picsum.photos/id/${getImageIdFromName(row.interviewer)}/40/40` };

   return {
      "조": index + 1,
      "지원자":
         <div className="flex items-center px-100 py-50 gap-150">
            <UserAvatar image={interviewee.img} />
            <span className='font-designer-14m whitespace-nowrap'>{interviewee.name}</span>
         </div>,
      "면접관":
         <div className="flex items-center px-100 py-50 gap-150">
            <UserAvatar image={interviewer.img} />
            <span className='font-designer-14m whitespace-nowrap'>{interviewer.name}</span>
         </div>,
      "면접 주제": row.subject,
      "피드백": <p className="max-w-[300px] text-sm text-text-default line-clamp-2">
         {row.feedBack ?? "-"}
      </p>,
      "진행 상태": statusBadgeMap[row.progressStatus],
      "참고 자료": row.link ? (
         <a href={row.link} target="_blank" rel="noopener noreferrer">
            <LinkIcon className="w-4 h-4 text-blue-500 hover:text-blue-700" />
         </a>
      ) : null,
   };
}


export default function StudyListSection() {
   // const { data, isLoading, error } = useDailyStudiesQuery({
   //    cursor: 1,
   //    pageSize: 10,
   //    planTime: '2025-05-24',
   // });

   // if (isLoading) return <div>로딩 중...</div>;
   // if (error) return <div>에러 발생</div>;
   // if (!data) return null;

   // const displayData: Record<Header, React.ReactNode>[] = data.dailyStudyResponses.map(mapDailyStudyToDisplayData);

   const displayData: Record<Header, React.ReactNode>[] = mockData.map(mapDailyStudyToDisplayData);

   return (
      <section className="w-full">
         <h3 className="font-bold-h5 pb-150">오늘의 스터디 리스트</h3>
         <TableList headers={headers} data={displayData} />
      </section>
   );
}
