'use client';

import React from 'react';
import Link from 'next/link';
import { MOCK_WEEKLY_DATA } from '@/app/(service)/one-on-one/shared-data';
import { MessageCircle, Star, Heart } from 'lucide-react';

export default function WeeklyPick() {
  // Find the manager's pick
  const managerPick = MOCK_WEEKLY_DATA.find((item) => item.isManagerPick);

  if (!managerPick) return null;

  return (
    <Link href="/insights/weekly" className="group block">
      <div className="relative overflow-hidden rounded-200 bg-gradient-to-r from-fill-brand-default-default/10 to-transparent p-[1px]">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-fill-brand-default-default/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="relative flex flex-col gap-200 rounded-200 bg-background-default p-400 transition-transform duration-300 group-hover:-translate-y-50 shadow-1 group-hover:shadow-2">
          {/* Header */}
          <div className="flex items-center gap-100">
            <div className="flex items-center gap-50 rounded-100 bg-fill-brand-default-default px-150 py-50 text-text-inverse">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-designer-12b">Manager's Pick</span>
            </div>
            <span className="font-designer-13m text-text-brand">
              이번 주 위클리 토픽
            </span>
          </div>

          {/* Content */}
          <div>
            <h3 className="mb-50 font-bold-h5 text-text-strong line-clamp-1 group-hover:text-text-brand transition-colors">
              {managerPick.title}
            </h3>
            <p className="font-designer-14r text-text-subtle line-clamp-2">
              {managerPick.content}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border-subtle pt-200 mt-100">
            <div className="flex items-center gap-100 text-text-subtle">
              <span className="font-designer-12b">{managerPick.author}</span>
              <span className="h-[10px] w-[1px] bg-border-subtle" />
              <span className="font-designer-12r">{managerPick.date}</span>
            </div>
            <div className="flex items-center gap-200">
              <div className="flex items-center gap-50 text-red-500">
                <Heart className="w-4 h-4 fill-current" />
                <span className="font-designer-12b">{managerPick.likes}</span>
              </div>
              <div className="flex items-center gap-50 text-text-brand">
                <MessageCircle className="h-4 w-4" />
                <span className="font-designer-12b">{managerPick.comments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

