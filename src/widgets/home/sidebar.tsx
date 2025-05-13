import Calendar from "@/features/calendar/index";
import TodoList from "@/features/todo/todo-list";
import UserProfileCard from "@/features/user-profile/user-profile-card";

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

         <TodoList />
         <Calendar />
      </aside>
   );
}
