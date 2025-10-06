'use client';

import { useEffect, useRef, useState } from 'react';
import { formatYYYYMMDD } from '@/shared/lib/time';
import Badge from '@/shared/ui/badge';
import Checkbox from '@/shared/ui/checkbox';
import { SingleDropdown } from '@/shared/ui/dropdown';
import Pagination from '@/shared/ui/pagination';
import { MemberStatus, RoleId } from '../api/types';
import { useGetMemberListQuery } from '../model/use-member-list-query';

const ROLE_OPTIONS = [
  {
    value: '일반',
    label: '일반',
  },
  {
    value: '멘토',
    label: '멘토',
  },
];

const MEMBER_STATUS_OPTIONS = [
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
];

export default function MemberListTable() {
  const [roleId, setRoleId] = useState<RoleId>();
  const [memberStatus, setMemberStatus] = useState<MemberStatus>();
  const [searchKeyword, setSearchKeyword] = useState<string>();
  const [page, setPage] = useState<number>(1);

  const { data } = useGetMemberListQuery({
    roleId,
    memberStatus,
    searchKeyword,
    page,
  });

  const memberList = data?.content || [];

  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const headerCheckboxRef = useRef(null);

  const allSelected =
    memberList.length > 0 && selectedIds.size === memberList.length; // 모든 행을 선택했는지
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < memberList.length; // 한개 이상 행을 선택했는지

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(memberList.map((u) => u.memberId)));
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
    <>
      <div className="mt-300 mb-200 flex justify-end gap-150 py-100">
        <MemberListFilter />
      </div>

      <div>
        <div className="border-border-subtle rounded-100 overflow-hidden border">
          <table className="rounded-100 w-full">
            <thead className="bg-background-neutral-subtle h-[54px]">
              <tr>
                <th className="flex h-[54px] w-fit justify-center pr-100 pl-300">
                  <Checkbox
                    id="all"
                    onToggle={toggleAll}
                    checked={allSelected}
                  />
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
              {memberList.map((user, idx) => (
                <tr
                  key={user.memberId}
                  className={
                    idx === memberList.length - 1
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

        <Pagination
          className="mt-200"
          page={page}
          onChangePage={setPage}
          totalPages={data?.totalPages}
          middleButtonCount={4}
        />
      </div>
    </>
  );
}

function MemberListFilter() {
  return (
    <div className="flex w-[300px] gap-150">
      <SingleDropdown options={ROLE_OPTIONS} placeholder="권한" />
      <SingleDropdown options={MEMBER_STATUS_OPTIONS} placeholder="계정 상태" />
    </div>
  );
}
