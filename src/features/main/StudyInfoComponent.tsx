'use client';

import { Pencil } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';


interface StudyInfoProps {
   interviewer: string;
   teamName: string;
   status: string;
}

const StudyInfoComponent: React.FC<StudyInfoProps> = ({
   interviewer = '최예림',
   teamName = '2조',
   status = '시작 전',
}) => {
   return (
      <Card className="w-full max-w-5xl mx-auto p-6 rounded-2xl border-gray-900 shadow-sm">
         <CardContent className="p-0">
            <div className="flex items-start justify-between mb-6">
               <h2 className="text-xl font-semibold">오늘의 스터디</h2>
               <Button variant="outline" className="flex items-center gap-1 text-sm">
                  면접 준비하기
                  <Pencil className="w-4 h-4" />
               </Button>
            </div>

            <div className="flex gap-6">
               <div className="flex flex-col gap-6 text-sm flex-1">
                  <div className="flex justify-between items-center">
                     <div className="text-xs">면접자</div>
                     <div className="flex items-center gap-2 border-1 rounded-full border-gray-900 p-1">
                        <Avatar className="w-7 h-7">
                           <AvatarImage src="https://github.com/shadcn.png" />
                           <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <span className="text-black">{interviewer}</span>
                     </div>
                  </div>

                  {/* 스터디 조 */}
                  <div className="flex justify-between items-center text-sm">
                     <div className="text-xs">스터디 조</div>
                     <div className="text-black">{teamName}</div>
                  </div>

                  {/* 면접 주제 및 참고 자료 */}
                  <div className="flex justify-between items-start">
                     <div className="text-sm font-medium">면접 주제 및 참고 자료</div>
                     <div className="flex items-center text-xs text-gray-400 max-w-[60%] text-right">
                        <span className="mr-1">ℹ️</span>
                        면접관이 확인할 수 있도록 주제와 자료를 등록하세요.
                     </div>
                  </div>
               </div>

               <div className="w-px bg-gray-800" />

               <div className="flex flex-col gap-6 text-sm flex-1">
                  <div className="flex justify-between items-center text-sm">
                     <div className="text-xs">진행 현황</div>
                     <div className="text-black">{status}</div>
                  </div>

                  {/* 피드백 */}
                  <div className="flex justify-between items-start">
                     <div className="text-xs">피드백</div>
                     <div className="flex items-center text-xs text-gray-400 max-w-[60%] text-right">
                        <span className="mr-1">ℹ️</span>
                        면접 종료 후 피드백을 확인하세요.
                     </div>
                  </div>
               </div>
            </div>
         </CardContent>
      </Card>
   );
};

export default StudyInfoComponent;
