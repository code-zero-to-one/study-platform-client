'use client';

import { useEffect, useRef, useState } from 'react';
import { formatYYYYMMDD } from '@/shared/lib/time';
import Badge from '@/shared/ui/badge';
import Button from '@/shared/ui/button';
import Checkbox from '@/shared/ui/checkbox';
import { SingleDropdown } from '@/shared/ui/dropdown';
import Pagination from '@/shared/ui/pagination';
import { MemberStatus, RoleId } from '../api/types';
import { useGetMemberListQuery } from '../model/use-member-list-query';

const ROLE_MAP = {
  ROLE_MEMBER: '일반',
  ROLE_MENTOR: '멘토',
  ROLE_ADMIN: '관리자',
};
const ROLE_OPTIONS = Object.entries(ROLE_MAP).map(([key, label]) => ({
  value: key,
  label,
}));

const MEMBER_STATUS_MAP = {
  ACTIVE: '활성',
  PERM_BAN: '일시정지',
  PAUSED: '영구정지',
  DORMANT: '휴면',
};
const MEMBER_STATUS_OPTIONS = Object.entries(MEMBER_STATUS_MAP).map(
  ([key, label]) => ({
    value: key,
    label,
  }),
);

export default function MemberListTable() {
  const [roleId, setRoleId] = useState<RoleId | null>(null);
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string | null>(null);
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
      <div className="mt-300 mb-200 flex items-center justify-end gap-150 py-100">
        <MemberListFilter
          roleId={roleId}
          memberStatus={memberStatus}
          onSelectRoleId={setRoleId}
          onSelectMemberStatus={setMemberStatus}
        />
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
                    {ROLE_MAP[user.role.roleId]}
                  </td>
                  <td className="pr-500 pl-300">
                    <Badge
                      color={user.memberStatus === 'ACTIVE' ? 'green' : 'gray'}
                      shape="rectangle"
                    >
                      {MEMBER_STATUS_MAP[user.memberStatus]}
                    </Badge>
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

function MemberListFilter({
  roleId,
  memberStatus,
  onSelectRoleId,
  onSelectMemberStatus,
}: {
  roleId: RoleId | null;
  memberStatus: MemberStatus | null;
  onSelectRoleId: (roleId: RoleId | null) => void;
  onSelectMemberStatus: (memberStatus: MemberStatus | null) => void;
}) {
  return (
    <>
      {(roleId || memberStatus) && (
        <Button
          size="small"
          className="h-fit"
          onClick={() => {
            onSelectRoleId(null);
            onSelectMemberStatus(null);
          }}
        >
          필터 제거
        </Button>
      )}
      <div className="flex w-[300px] items-center gap-150">
        <SingleDropdown
          value={roleId}
          onChange={onSelectRoleId}
          options={ROLE_OPTIONS}
          placeholder="권한"
        />
        <SingleDropdown
          value={memberStatus}
          onChange={onSelectMemberStatus}
          options={MEMBER_STATUS_OPTIONS}
          placeholder="계정 상태"
        />
      </div>
    </>
  );
}
