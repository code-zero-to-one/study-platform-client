'use client';

import { useEffect, useRef, useState } from 'react';
import { formatYYYYMMDD } from '@/shared/lib/time';
import Badge from '@/shared/ui/badge';
import Button from '@/shared/ui/button';
import Checkbox from '@/shared/ui/checkbox';
import { SingleDropdown } from '@/shared/ui/dropdown';
import Pagination from '@/shared/ui/pagination';
import FilledX from 'public/icons/filled-x.svg';
import SearchIcon from 'public/icons/search.svg';
import ChangeStatusModal from './chage-status-modal';
import { MemberStatus, RoleId } from '../api/types';
import { MEMBER_STATUS_MAP, ROLE_MAP } from '../const/member';
import { useGetMemberListQuery } from '../model/use-member-list-query';

const ROLE_OPTIONS = Object.entries(ROLE_MAP).map(([key, label]) => ({
  value: key,
  label,
}));

const MEMBER_STATUS_OPTIONS = Object.entries(MEMBER_STATUS_MAP).map(
  ([key, label]) => ({
    value: key,
    label,
  }),
);

export default function MemberListTable() {
  const [roleId, setRoleId] = useState<RoleId | null>(null);
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data } = useGetMemberListQuery({
    roleId,
    memberStatus,
    searchKeyword,
    page,
  });

  const memberList = data?.content || [];

  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold-h4">사용자 관리</h1>
          <span className="font-designer-16r text-text-subtle">총 </span>
          <span className="font-designer-16r text-text-information">
            {data?.totalElements}
          </span>
          <span className="font-designer-16r text-text-subtle">
            명의 사용자
          </span>
        </div>

        <MemberListSearchInput
          value={searchKeyword}
          onChange={setSearchKeyword}
        />
      </div>

      <div className="mt-300 mb-200 flex w-full items-center justify-between py-100">
        <div>
          {someSelected && (
            <div className="border-border-default rounded-100 flex h-[56px] items-center gap-300 border px-200 py-150">
              <p className="font-designer-14r">
                <span className="text-text-information">
                  {selectedIds.size}
                </span>
                <span className="text-text-subtle">명 선택</span>
              </p>

              <div className="flex items-center gap-150">
                <Button size="small" color="secondary">
                  권한 변경
                </Button>
                <ChangeStatusModal
                  members={memberList.filter((member) =>
                    selectedIds.has(member.memberId),
                  )}
                />
              </div>
            </div>
          )}
        </div>

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
    <div className="flex items-center gap-200">
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
    </div>
  );
}

function MemberListSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-100 border-border-default text-text-default placeholder:text-text-subtlest font-designer-14m flex h-[40px] items-center justify-between border px-150">
      <div className="flex items-center gap-100">
        <SearchIcon />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="outline-0"
          placeholder="이름으로 검색"
        />
      </div>

      {value.length > 0 && (
        <button className="cursor-pointer" onClick={() => onChange('')}>
          <FilledX />
        </button>
      )}
    </div>
  );
}
