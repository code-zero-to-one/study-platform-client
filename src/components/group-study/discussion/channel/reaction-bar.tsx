// entities/reaction/ReactionBar.tsx
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import * as React from 'react';
import { REACTION } from '@/types/api/channel.types';

export function ReactionBar({
  likes,
  dislikes,
  active,
  disabled,
  onLike,
  onDislike,
  className,
}: {
  likes: number;
  dislikes: number;
  active: REACTION;
  disabled?: boolean;
  onLike: () => void;
  onDislike: () => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-150 ${className ?? ''}`}>
      <div className="flex gap-100">
        <ThumbsUp
          size={17}
          className={`ml-200 cursor-pointer ${active === 'LIKE' ? 'fill-current' : ''} ${disabled ? 'pointer-events-none opacity-60' : ''}`}
          onClick={onLike}
        />
        <span className="font-designer-13r text-text-subtlest ml-50">
          {likes}
        </span>
      </div>
      <div className="flex gap-100">
        <ThumbsDown
          size={17}
          className={`ml-200 cursor-pointer ${active === 'DISLIKE' ? 'fill-current' : ''} ${disabled ? 'pointer-events-none opacity-60' : ''}`}
          onClick={onDislike}
        />
        <span className="font-designer-13r text-text-subtlest ml-50">
          {dislikes}
        </span>
      </div>
    </div>
  );
}
