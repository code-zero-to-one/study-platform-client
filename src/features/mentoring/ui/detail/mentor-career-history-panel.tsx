'use client';

import { BadgeCheck, BriefcaseBusiness } from 'lucide-react';
import {
  formatMentorCareerEntryPeriodLabel,
  MENTOR_CAREER_ENTRY_MAX_COUNT,
  type MentorCareerEntry,
} from '@/features/mentoring/model/mentor-settings';

const hasSortableCareerPeriod = (entry: MentorCareerEntry) => {
  return (
    entry.periodEnabled &&
    (entry.startMonth.length > 0 ||
      entry.endMonth.length > 0 ||
      entry.isCurrent)
  );
};

const getEffectiveCareerEndMonth = (entry: MentorCareerEntry) => {
  if (entry.isCurrent) {
    return '9999-12';
  }

  if (entry.endMonth.length > 0) {
    return entry.endMonth;
  }

  return entry.startMonth;
};

const sortCareerEntriesForDetail = (entries: MentorCareerEntry[]) => {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((left, right) => {
      const leftHasPeriod = hasSortableCareerPeriod(left.entry);
      const rightHasPeriod = hasSortableCareerPeriod(right.entry);

      if (leftHasPeriod !== rightHasPeriod) {
        return leftHasPeriod ? -1 : 1;
      }

      if (!leftHasPeriod && !rightHasPeriod) {
        return left.index - right.index;
      }

      if (left.entry.isCurrent !== right.entry.isCurrent) {
        return left.entry.isCurrent ? -1 : 1;
      }

      const endMonthComparison = getEffectiveCareerEndMonth(
        right.entry,
      ).localeCompare(getEffectiveCareerEndMonth(left.entry));
      if (endMonthComparison !== 0) {
        return endMonthComparison;
      }

      const startMonthComparison = right.entry.startMonth.localeCompare(
        left.entry.startMonth,
      );
      if (startMonthComparison !== 0) {
        return startMonthComparison;
      }

      return left.index - right.index;
    })
    .map(({ entry }) => entry);
};

interface MentorCareerHistoryPanelProps {
  careerEntries: MentorCareerEntry[];
  careerHistory: string[];
}

export default function MentorCareerHistoryPanel({
  careerEntries,
  careerHistory,
}: MentorCareerHistoryPanelProps) {
  const visibleEntries = sortCareerEntriesForDetail(careerEntries)
    .filter((entry) => entry.description.trim().length > 0)
    .slice(0, MENTOR_CAREER_ENTRY_MAX_COUNT);
  const visibleCareerHistory = careerHistory.slice(
    0,
    MENTOR_CAREER_ENTRY_MAX_COUNT,
  );

  return (
    <section className="border-border-subtle xl:border-l xl:pl-300">
      <div className="mb-200 flex items-center gap-75">
        <h2 className="font-designer-20b text-text-strong">주요 이력</h2>
        <BadgeCheck className="text-text-information h-18 w-18" />
      </div>

      {visibleEntries.length > 0 ? (
        <div className="divide-border-subtle divide-y">
          {visibleEntries.map((entry, index) => (
            <div
              key={`${entry.description}-${index}`}
              className="flex gap-150 py-175 first:pt-0 last:pb-0"
            >
              <div className="rounded-100 bg-background-alternative flex h-650 w-650 shrink-0 items-center justify-center">
                <BriefcaseBusiness className="text-text-subtle h-22 w-22" />
              </div>
              <div className="min-w-0 flex flex-1 flex-col justify-center gap-25">
                {formatMentorCareerEntryPeriodLabel(entry) && (
                  <p className="font-designer-12r text-text-subtle">
                    {formatMentorCareerEntryPeriodLabel(entry)}
                  </p>
                )}
                <p className="font-designer-16b text-text-strong leading-relaxed break-words">
                  {entry.description}
                </p>
                {entry.isCurrent && (
                  <p className="font-designer-12r text-text-information">
                    재직 중
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : visibleCareerHistory.length > 0 ? (
        <div className="divide-border-subtle divide-y">
          {visibleCareerHistory.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex gap-175 py-175 first:pt-0 last:pb-0"
            >
              <div className="rounded-100 bg-background-alternative flex h-700 w-700 shrink-0 items-center justify-center">
                <BriefcaseBusiness className="text-text-subtle h-24 w-24" />
              </div>
              <p className="font-designer-16r text-text-subtle leading-relaxed">
                {item}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-150 bg-background-alternative px-200 py-250">
          <p className="font-designer-14r text-text-subtle leading-relaxed">
            주요 이력이 아직 등록되지 않았습니다.
          </p>
        </div>
      )}
    </section>
  );
}
