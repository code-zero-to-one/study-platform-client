'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageCircle, 
  Heart, 
  Plus, 
  Send, 
  Trash2, 
  X, 
  Clock,
  Users,
  Eye,
  Loader2
} from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { MOCK_WEEKLY_DATA, WeeklyPost, WeeklyComment } from '@/app/(service)/one-on-one/shared-data';
import AdminPickButton from '@/components/weekly/admin-pick-button';

export default function WeeklyPage() {
  const [posts, setPosts] = useState<WeeklyPost[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<WeeklyPost | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // Mock admin status

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setPosts(MOCK_WEEKLY_DATA);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const managerPick = posts.find(post => post.isManagerPick);
  const regularPosts = posts.filter(post => !post.isManagerPick);

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    const newPost: WeeklyPost = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      author: 'User_Me',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
      isManagerPick: false,
      likes: 0,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setIsWriting(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;

    const comment: WeeklyComment = {
      id: Date.now(),
      author: 'User_Me',
      content: newComment,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    };

    const updatedPost = {
      ...selectedPost,
      comments: [...selectedPost.comments, comment]
    };

    setPosts(prev => prev.map(post => 
      post.id === selectedPost.id ? updatedPost : post
    ));
    setSelectedPost(updatedPost);
    setNewComment('');
  };

  const handleTogglePick = (postId: number) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, isManagerPick: !post.isManagerPick };
      }
      // 다른 게시글의 픽 상태를 해제 (한 번에 하나만 픽 가능)
      return { ...post, isManagerPick: false };
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-alternative flex items-center justify-center">
        <div className="flex flex-col items-center gap-400">
          <Loader2 className="w-8 h-8 animate-spin text-text-brand" />
          <p className="font-designer-16m text-text-subtle">
            데이터를 불러오는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-alternative">
      <div className="w-full max-w-screen-xl mx-auto flex gap-600 px-400 py-600">
        {/* Left Sidebar */}
        <aside className="w-[200px] shrink-0 flex flex-col gap-400 pt-100 sticky top-400 h-fit">
          <div className="flex flex-col gap-50">
            <h1 className="font-bold-h5 text-text-strong tracking-tight">위클리 소통</h1>
            <span className="font-designer-13r text-text-subtle tracking-tight">
              함께 나누는 이야기
            </span>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col gap-400">

            {/* Header */}
            <div className="flex items-center justify-between mb-400">
              <h2 className="font-display-headings6 text-text-strong">위클리 소통 공간</h2>
              <button
                onClick={() => setIsWriting(true)}
                className="flex items-center gap-100 px-300 py-150 rounded-100 bg-fill-brand-default-default text-text-inverse font-designer-14b shadow-1 hover:bg-fill-brand-default-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                글쓰기
              </button>
            </div>

            {/* Manager's Pick */}
            {managerPick && (
              <div className="mb-600">
                <div className="bg-background-default rounded-200 border border-border-brand p-500 shadow-2">
                  <div className="flex items-center gap-200 mb-300">
                    <div className="flex items-center gap-100 bg-fill-brand-default-default text-text-inverse px-200 py-100 rounded-100">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-designer-13b">Manager's Pick</span>
                    </div>
                  </div>

                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedPost(managerPick)}
                  >
                    <h3 className="font-bold-h4 text-text-strong mb-300 line-clamp-2 hover:text-text-brand transition-colors">
                      {managerPick.title}
                    </h3>
                    <p className="font-designer-15r text-text-subtle line-clamp-3 mb-400 leading-relaxed">
                      {managerPick.content}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-border-subtle pt-300">
                      <div className="flex items-center gap-200">
                        <div className="flex items-center gap-100 text-text-subtle">
                          <div className="w-8 h-8 bg-fill-neutral-strong-default rounded-full flex items-center justify-center text-text-inverse font-bold text-sm">
                            {managerPick.author.charAt(0)}
                          </div>
                          <span className="font-designer-13b text-text-default">{managerPick.author}</span>
                        </div>
                        <div className="flex items-center gap-100 text-text-subtlest">
                          <Clock className="w-3 h-3" />
                          <span className="font-designer-12r">{managerPick.date}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(managerPick.id);
                          }}
                          className="flex items-center gap-100 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="font-designer-13b">{managerPick.likes}</span>
                        </button>
                        
                        <div className="flex items-center gap-100 text-text-brand">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-designer-13b">{managerPick.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regular Posts */}
            <div className="bg-background-default rounded-200 border border-border-subtle overflow-hidden shadow-1">
              {regularPosts.length > 0 ? (
                <div className="divide-y divide-border-subtlest">
                  {regularPosts.map((post) => (
                    <div
                      key={post.id}
                      className="group flex items-center gap-300 px-400 py-300 hover:bg-fill-neutral-subtle-hover transition-colors cursor-pointer"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="flex-1 min-w-0 flex flex-col gap-100">
                        <div className="flex items-center gap-200 mb-100">
                          <div className="w-8 h-8 bg-fill-neutral-strong-default rounded-full flex items-center justify-center text-text-inverse font-bold text-sm">
                            {post.author.charAt(0)}
                          </div>
                          <div className="flex items-center gap-100">
                            <span className="font-designer-13b text-text-default">{post.author}</span>
                            <span className="w-[1px] h-[10px] bg-border-subtle"></span>
                            <span className="font-designer-12r text-text-subtlest">{post.date}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-designer-15b text-text-strong group-hover:text-text-brand transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="font-designer-13r text-text-subtle line-clamp-2 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-300">
                        <AdminPickButton
                          isManagerPick={post.isManagerPick}
                          onTogglePick={() => handleTogglePick(post.id)}
                          isAdmin={isAdmin}
                        />
                        
                        <div className="flex items-center gap-200 text-text-subtle">
                          <div className="flex items-center gap-50 font-designer-12r">
                            <Heart className="w-3.5 h-3.5" />
                            {post.likes}
                          </div>
                          <div className="flex items-center gap-50 font-designer-12r">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {post.comments.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-800 text-center text-text-subtlest flex flex-col items-center gap-200">
                  <MessageCircle className="w-10 h-10 opacity-20" />
                  <p className="font-designer-16m">아직 게시글이 없습니다.</p>
                  <p className="font-designer-14r">첫 번째 이야기를 시작해보세요.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Write Modal */}
      {isWriting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-400">
          <div className="w-full max-w-[600px] bg-background-default rounded-200 shadow-4 p-400 flex flex-col gap-300">
            <div className="flex items-center justify-between border-b border-border-subtle pb-200">
              <h3 className="font-bold-h5 text-text-strong">글쓰기</h3>
              <button onClick={() => setIsWriting(false)} className="text-text-subtle hover:text-text-strong">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-200">
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-200 rounded-100 border border-border-subtle focus:border-border-strong outline-none font-designer-15m"
              />
              <textarea
                placeholder="내용을 입력하세요"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full h-[200px] p-200 rounded-100 border border-border-subtle focus:border-border-strong outline-none font-designer-14r resize-none"
              />
            </div>
            <div className="flex justify-end gap-150 pt-100">
              <button 
                onClick={() => setIsWriting(false)} 
                className="px-300 py-150 rounded-100 border border-border-subtle text-text-subtle font-designer-14m hover:bg-fill-neutral-subtle-hover"
              >
                취소
              </button>
              <button 
                onClick={handleCreatePost}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="px-300 py-150 rounded-100 bg-fill-brand-default-default text-text-inverse font-designer-14b hover:bg-fill-brand-default-hover disabled:opacity-50"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-400">
          <div className="w-full max-w-[700px] max-h-[90vh] bg-background-default rounded-200 shadow-4 flex flex-col">
            {/* Header */}
            <div className={cn(
              "p-400 border-b border-border-subtle flex justify-between items-start gap-200",
              selectedPost.isManagerPick && "bg-fill-brand-subtle-default"
            )}>
              <div className="flex flex-col gap-100">
                {selectedPost.isManagerPick && (
                  <div className="flex items-center gap-100 mb-100">
                    <div className="flex items-center gap-50 bg-fill-brand-default-default text-text-inverse px-150 py-50 rounded-100 text-sm">
                      <Star className="w-3 h-3 fill-current" />
                      Manager's Pick
                    </div>
                  </div>
                )}
                <h3 className="font-bold-h5 text-text-strong">{selectedPost.title}</h3>
                <div className="flex items-center gap-150 font-designer-12r text-text-subtle">
                  <span>{selectedPost.author}</span>
                  <span className="w-[1px] h-[10px] bg-border-subtle"></span>
                  <span>{selectedPost.date}</span>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-text-subtle hover:text-text-strong shrink-0 mt-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-400 overflow-y-auto min-h-[200px]">
              <p className="font-designer-15r text-text-strong whitespace-pre-wrap leading-relaxed">
                {selectedPost.content}
              </p>
            </div>

            {/* Comments Section */}
            <div className="p-400 bg-background-alternative border-t border-border-subtle flex flex-col gap-300">
              <div className="flex items-center gap-100 font-designer-14b text-text-strong">
                <MessageCircle className="w-4 h-4" />
                댓글 {selectedPost.comments.length}
              </div>

              {/* Comment List */}
              <div className="flex flex-col gap-200 max-h-[200px] overflow-y-auto pr-100">
                {selectedPost.comments.map(comment => (
                  <div key={comment.id} className="bg-background-default p-200 rounded-100 border border-border-subtle">
                    <div className="flex justify-between items-start mb-50">
                      <div className="flex items-center gap-100 font-designer-12r">
                        <span className="font-bold text-text-strong">{comment.author}</span>
                        <span className="text-text-subtlest">{comment.date}</span>
                      </div>
                    </div>
                    <p className="font-designer-14r text-text-default">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div className="flex gap-150">
                <input
                  type="text"
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="flex-1 p-200 rounded-100 border border-border-subtle focus:border-border-strong outline-none font-designer-14r bg-background-default"
                />
                <button 
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-200 rounded-100 bg-fill-neutral-strong-default text-text-inverse hover:bg-fill-neutral-strong-hover disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
