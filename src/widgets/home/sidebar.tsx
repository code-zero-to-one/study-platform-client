import StartStudyModal from '@/features/study/ui/start-study-modal';
import UserProfileCard from '@/features/study/ui/user-profile-card';
import Calendar from '@/widgets/home/calendar/index';
import TodoList from '@/widgets/home/todo-list';

export default function Sidebar() {
  const hasTodo = false; // 나중에 스터디 참여 유무로 변경할 예정

  return (
    <aside className="flex flex-col gap-300">
      <UserProfileCard
        name="신채호"
        imageUrl=""
        matching={true}
        subject="CS DeepDive"
        time="오전, 심야"
        techStacks="HTML/CSS, Git/GitHub"
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
