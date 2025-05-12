// header.tsx
"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/shadcn/ui/avatar";

export default function Header() {
   return (
      <header className="w-full border-b border-[#E7E8EA] mix-blend-multiply bg-white">
         <div className="container mx-auto h-16 px-6 flex items-center justify-between gap-100">
            <div className="shrink-0 font-designer-18b text-text-strong">
               <Link href="/">ZERO-ONE</Link>
            </div>

            <nav className="hidden flex-grow md:flex gap-6 font-designer-14m text-text-default">
               <Link href="/about">제로원 알아보기</Link>
               <Link href="/study">마이스터디</Link>
            </nav>

            <div className="shrink-0 flex items-center gap-4">
               <Link href="/notifications" aria-label="알림">
                  <Bell className="w-5 h-5 text-gray-700 hover:text-black transition-colors" />
               </Link>
               <Link href="/mypage">
                  <Avatar className="w-8 h-8">
                     <AvatarImage src="/user.png" alt="프로필" />
                     <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
               </Link>
            </div>
         </div>
      </header>
   );
}
