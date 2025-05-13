import Calendar from "@/features/calendar/index";
import TodoList from "@/features/todo/todo-list";
import UserProfileCard from "@/features/user-profile/user-profile-card";

export default function Sidebar() {
   return (
      <aside className="flex flex-col gap-6">
         <UserProfileCard />
         <TodoList />
         <Calendar />
      </aside>
   );
}
