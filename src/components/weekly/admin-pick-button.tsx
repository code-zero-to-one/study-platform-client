'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Crown } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface AdminPickButtonProps {
  isManagerPick: boolean;
  onTogglePick: () => void;
  isAdmin?: boolean;
}

export default function AdminPickButton({ 
  isManagerPick, 
  onTogglePick, 
  isAdmin = false 
}: AdminPickButtonProps) {
  if (!isAdmin) return null;

  return (
    <motion.button
      onClick={onTogglePick}
      className={cn(
        "flex items-center gap-100 px-200 py-100 rounded-100 font-designer-12b transition-all duration-300",
        isManagerPick
          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2"
          : "bg-background-default border border-border-subtle text-text-subtle hover:border-yellow-400 hover:text-yellow-600"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isManagerPick ? (
        <>
          <Crown className="w-3 h-3 fill-current" />
          픽 해제
        </>
      ) : (
        <>
          <Star className="w-3 h-3" />
          관리자 픽
        </>
      )}
    </motion.button>
  );
}
