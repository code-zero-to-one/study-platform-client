import { ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';

interface ReactionProps {
  likesCount: number;
  dislikesCount: number;
  myReaction: string | null;
}

export default function Reaction({
  likesCount,
  dislikesCount,
  myReaction,
}: ReactionProps) {
  const [active, setActive] = useState({
    like: myReaction === 'LIKE',
    dislike: myReaction === 'DISLIKE',
  });

  const [counts, setCounts] = useState({
    likes: likesCount,
    dislikes: dislikesCount,
  });
  // 👍 좋아요 토글
  const handleLike = () => {
    // 현재 상태 복사
    const prev = { ...active };
    const nextActive = {
      like: !prev.like,
      dislike: prev.like ? prev.dislike : false, // 이전 값이 true이면
    };

    let newLikes = counts.likes;
    let newDislikes = counts.dislikes;

    // 좋아요 토글 로직
    if (!prev.like)
      newLikes += 1; // 좋아요 누름
    else newLikes -= 1; // 좋아요 해제

    // 싫어요가 눌려있던 경우 해제
    if (prev.dislike && !prev.like) newDislikes -= 1;

    setActive(nextActive);
    setCounts({ likes: newLikes, dislikes: newDislikes });
  };

  // 👎 싫어요 토글
  const handleDislike = () => {
    const prev = { ...active };
    const nextActive = {
      like: prev.dislike ? prev.like : false, // 싫어요 누르면 좋아요 해제
      dislike: !prev.dislike,
    };

    let newLikes = counts.likes;
    let newDislikes = counts.dislikes;

    if (!prev.dislike)
      newDislikes += 1; // 싫어요 누름
    else newDislikes -= 1; // 싫어요 해제

    // 좋아요가 눌려있던 경우 해제
    if (prev.like && !prev.dislike) newLikes -= 1;

    setActive(nextActive);
    setCounts({ likes: newLikes, dislikes: newDislikes });
  };

  return (
    <div className="ml-[52px] flex gap-150">
      <div className="flex gap-100">
        <ThumbsUp
          size={17}
          className={`ml-200 cursor-pointer ${active.like && 'fill-current'}`}
          onClick={handleLike}
        />

        <span className="font-designer-13r text-text-subtlest ml-50">
          {counts.likes}
        </span>
      </div>

      <div className="flex gap-100">
        <ThumbsDown
          size={17}
          className={`ml-200 cursor-pointer ${active.dislike && 'fill-current'}`}
          onClick={handleDislike}
        />
        <span className="font-designer-13r text-text-subtlest ml-50">
          {counts.dislikes}
        </span>
      </div>
    </div>
  );
}
