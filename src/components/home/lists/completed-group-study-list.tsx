import MyStudyInfoCard from '@/components/my-page/my-study-info-card';
import type { MemberStudyItem } from '@/types/api/group-study.types';

interface MemberGroupStudyList extends MemberStudyItem {
  type: 'GROUP_STUDY' | 'MENTOR_STUDY';
}

interface CompletedGroupStudyListProps {
  studyList: MemberGroupStudyList[];
}

export default function CompletedGroupStudyList({
  studyList,
}: CompletedGroupStudyListProps) {
  return (
    <>
      {studyList.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-300">
          {studyList.map((study) => (
            <MyStudyInfoCard key={study.studyId} {...study} />
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center">
          <span className="font-designer-15r text-text-subtlest">
            종료된 스터디가 없습니다.
          </span>
        </div>
      )}
    </>
  );
}
