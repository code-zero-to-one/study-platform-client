'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { formatYYYYMMDD } from '@/shared/lib/time';
import Badge from '@/shared/ui/badge';
import Checkbox from '@/shared/ui/checkbox';
import { SingleDropdown } from '@/shared/ui/dropdown';

export default function AdminPage() {
  return (
    <div className="flex min-w-[1200px]">
      <aside className="border-border-subtle h-screen w-fit border-r p-200">
        <div className="border-border-subtle flex items-center gap-150 border-b py-200">
          <Image
            src="icons/book.svg"
            width={40}
            height={40}
            alt="admin-image"
            className="rounded-full"
          />

          <div className="w-[136px]">
            <p className="font-designer-14m text-text-default">관리자</p>
            <p className="font-designer-12r text-text-subtle">
              kimkim@gmail.com
            </p>
          </div>

          <Image src="icons/logout.svg" width={16} height={16} alt="logout" />
        </div>

        <nav className="mt-200">
          <Link
            href="/admin"
            className="bg-background-accent-blue-strong text-text-inverse font-designer-14m rounded-100 inline-block w-full px-200 py-150"
          >
            사용자 관리
          </Link>
        </nav>
      </aside>

      <div className="flex-1 p-300">
        <div className="flex items-center">
          <div>
            <h1 className="font-bold-h4">사용자 관리</h1>
            <span className="font-designer-16r text-text-subtle">총 </span>
            <span className="font-designer-16r text-text-information">50</span>
            <span className="font-designer-16r text-text-subtle">
              명의 사용자
            </span>
          </div>
        </div>

        <div className="mt-300 mb-200 flex justify-end gap-150 py-100">
          <div className="flex w-[300px] gap-150">
            <SingleDropdown
              options={[
                {
                  value: '일반',
                  label: '일반',
                },
                {
                  value: '멘토',
                  label: '멘토',
                },
              ]}
              placeholder="권한"
            />
            <SingleDropdown
              options={[
                {
                  value: '활성',
                  label: '활성',
                },
                {
                  value: '일시정지',
                  label: '일시정지',
                },
                {
                  value: '영구정지',
                  label: '영구정지',
                },
                {
                  value: '휴면',
                  label: '휴면',
                },
              ]}
              placeholder="계정 상태"
            />
          </div>
        </div>

        <div>
          <UserTable />
        </div>
      </div>
    </div>
  );
}

// todo: API 연결
const users = [
  {
    memberId: 1,
    memberStatus: 'ACTIVE',
    memberName: '안유진',
    joinedAt: '2025-09-23T16:42:01.155Z',
    loginMostRecentlyAt: '2025-09-23T16:42:01.155Z',
    role: {
      roleId: 'ROLE_MEMBER',
      roleName: '일반',
    },
  },
  {
    memberId: 2,
    memberStatus: 'ACTIVE',
    memberName: '이현서',
    joinedAt: '2025-09-23T16:42:01.155Z',
    loginMostRecentlyAt: '2025-09-23T16:42:01.155Z',
    role: {
      roleId: 'ROLE_ADMIN',
      roleName: '관리자',
    },
  },
];

function UserTable() {
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const headerCheckboxRef = useRef(null);

  const allSelected = users.length > 0 && selectedIds.size === users.length; // 모든 행을 선택했는지
  const someSelected = selectedIds.size > 0 && selectedIds.size < users.length; // 한개 이상 행을 선택했는지

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.memberId)));
    }
  };

  const toggleRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  return (
    <div className="border-border-subtle rounded-100 overflow-hidden border">
      <table className="rounded-100 w-full">
        <thead className="bg-background-neutral-subtle h-[54px]">
          <tr>
            <th className="flex h-[54px] w-fit justify-center pr-100 pl-300">
              <Checkbox id="all" onToggle={toggleAll} checked={allSelected} />
            </th>
            <th className="font-designer-14m text-text-default px-300 text-left">
              이름
            </th>
            <th className="font-designer-14m text-text-default px-300 text-left">
              가입일
            </th>
            <th className="font-designer-14m text-text-default px-300 text-left">
              최근 로그인
            </th>
            <th className="font-designer-14m text-text-default px-300 text-left">
              권한
            </th>
            <th className="font-designer-14m text-text-default pr-500 pl-300 text-left">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user.memberId}
              className={
                idx === users.length - 1
                  ? ''
                  : 'border-b-border-subtle border-b'
              }
            >
              <td className="flex h-[54px] w-fit justify-center pr-100 pl-300">
                <Checkbox
                  id={user.memberId.toString()}
                  onToggle={() => toggleRow(user.memberId)}
                  checked={selectedIds.has(user.memberId)}
                />
              </td>
              <td className="font-designer-16m text-text-default px-300 text-left">
                {user.memberName}
              </td>
              <td className="font-designer-14r text-text-subtle px-300 text-left">
                {formatYYYYMMDD(user.joinedAt)}
              </td>
              <td className="font-designer-14r text-text-subtle px-300 text-left">
                {formatYYYYMMDD(user.loginMostRecentlyAt)}
              </td>
              <td className="font-designer-14r text-text-subtle px-300 text-left">
                {user.role.roleId === 'ROLE_ADMIN' ? '멘토' : '일반'}
              </td>
              <td className="pr-500 pl-300">
                {user.memberStatus === 'ACTIVE' && (
                  <Badge color="green" shape="rectangle">
                    활성
                  </Badge>
                )}
                {user.memberStatus === 'PAUSED' && (
                  <Badge color="gray" shape="rectangle">
                    영구정지
                  </Badge>
                )}
                {user.memberStatus === 'PERM_BAN' && (
                  <Badge color="gray" shape="rectangle">
                    일시정지
                  </Badge>
                )}
                {user.memberStatus === 'DORMANT' && (
                  <Badge color="gray" shape="rectangle">
                    휴면
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
