import UserProfileCard from '@/features/home/user-profile-card';
import Calendar from '@/widgets/home/calendar/index';
import TodoList from '@/widgets/home/todo-list';

export default function Sidebar() {
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
      <TodoList statusList={[true, false, false]} />
      <Calendar />
    </aside>
  );
}
