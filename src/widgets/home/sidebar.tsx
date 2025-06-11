import { getUserProfile } from '@/entities/user/api/get-user-profile';
import StartStudyModal from '@/features/study/ui/start-study-modal';
import UserProfileCard from "@/features/study/ui/user-profile-card";
import Calendar from "@/widgets/home/calendar/index";
import TodoList from "@/widgets/home/todo-list";

export default async function Sidebar() {

   const memberId = 1; // 실제론 쿠키에서 꺼내거나 미들웨어에서 받아와야 함
   const userProfile = await getUserProfile(memberId);

   const hasTodo = false;   // 나중에 스터디 참여 유무로 변경할 예정

   return (
      <aside className="flex flex-col gap-300">
         <UserProfileCard
            name={userProfile.memberProfile.memberName}
            imageUrl={userProfile.memberProfile.profileImage.resizedImages[0]?.resizedImageUrl}
            matching={userProfile.autoMatching}
            subject={userProfile.memberInfo.preferredStudySubject?.name ?? '선택안함'}
            time={userProfile.memberInfo.availableStudyTimes.length > 0
               ? userProfile.memberInfo.availableStudyTimes.map(t => t.label).join(', ')
               : '없음'}
            techStacks={userProfile.memberInfo.techStacks.length > 0
               ? userProfile.memberInfo.techStacks.map(t => t.techStackName).join(', ')
               : '없음'}
         />

         {hasTodo ? (
            <TodoList statusList={[true, false, false]} />
         ) : (
            <StartStudyModal />
         )}
         <Calendar />
      </aside>
   );
}
