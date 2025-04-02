'use client';

import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface TodoItem {
  label: string;
  done: boolean;
}

const todos: TodoItem[] = [
  { label: '면접 주제 및 참고자료 확인하기', done: true },
  { label: '스터디 진행 상태 체크하기', done: true },
  { label: '코멘트 작성하기', done: false },
];

const TodoComponent: React.FC = () => {
  return (
    <div className="w-full max-w-sm space-y-3">
      <h3 className="text-base font-semibold">오늘 할 일</h3>
      <ul className="space-y-2">
        {todos.map((todo, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            {todo.done ? (
              <CheckCircle className="text-green-500 w-4 h-4 mt-0.5" />
            ) : (
              <Circle className="text-gray-300 w-4 h-4 mt-0.5" />
            )}
            <span className={todo.done ? 'text-black' : 'text-muted-foreground'}>
              {todo.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoComponent;
