import Image from "next/image";
import { Badge } from "@/shared/ui/badge/index";
import TableList from "@/shared/ui/TableList";
import DefaultUserIcon from "public/icons/DefaultUser.svg";
import LinkIcon from "public/icons/Link.svg";

const headers = ["조", "지원자", "면접관", "면접 주제", "피드백", "진행 상태", "참고 자료"] as const;
type Header = (typeof headers)[number];

interface RawStudy {
   interviewer: string;
   interviewee: string;
   subject: string;
   feedBack: string | null;
   progressStatus: string;
   link: string;
}

interface StudyListSectionProps {
   rawData: RawStudy[];
}

const statusBadgeMap: Record<string, React.ReactNode> = {
   COMPLETED: <Badge color="completed">완료</Badge>,
   INCOMPLETE: <Badge color="incomplete">미완료</Badge>,
   IN_PROGRESS: <Badge color="default">진행 중</Badge>,
   NOT_STARTED: <Badge color="default">시작 전</Badge>,
};

/* 다른 구조에서도 사용 가능하기 때문에 분리 가능성 O, 이후 리팩토링*/
function renderUserCell(user: { name: string; img?: string }) {
   return (
      <div className="flex items-center gap-150">
         {user.img ? (
            <Image
               src={user.img}
               alt={user.name}
               width={32}
               height={32}
               className="rounded-full"
            />
         ) : (
            <DefaultUserIcon width="32" height="32" />
         )}
         <span>{user.name}</span>
      </div>
   );
}

function mapDailyStudyToDisplayData(row: RawStudy, index: number): Record<Header, React.ReactNode> {
   const interviewee = { name: row.interviewee, img: "" };
   const interviewer = { name: row.interviewer, img: "" };

   return {
      "조": index + 1,
      "지원자": renderUserCell(interviewee),
      "면접관": renderUserCell(interviewer),
      "면접 주제": row.subject,
      "피드백": <p className="max-w-[300px] text-sm text-text-default line-clamp-2">
         {row.feedBack ?? "-"}
      </p>,
      "진행 상태": statusBadgeMap[row.progressStatus] ?? row.progressStatus,
      "참고 자료": row.link ? (
         <a href={row.link} target="_blank" rel="noopener noreferrer">
            <LinkIcon className="w-4 h-4 text-blue-500 hover:text-blue-700" />
         </a>
      ) : null,
   };
}


export default function StudyListSection({ rawData }: StudyListSectionProps) {
   const displayData: Record<Header, React.ReactNode>[] = rawData.map(mapDailyStudyToDisplayData);

   return (
      <section className="w-full">
         <h3 className="font-bold-h5 pb-150">오늘의 스터디 리스트</h3>
         <TableList headers={headers} data={displayData} />
      </section>
   );
}
