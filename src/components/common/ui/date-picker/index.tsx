'use client';

import { ko } from 'date-fns/locale';
import dayjs from 'dayjs';
import { CalendarCheck2, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface DatePickerPropsBase {
  className?: string;
  disabled?: (date: Date) => boolean;
  startMonth?: Date;
  endMonth?: Date;
  placeholder?: string;
}

interface DatePickerSingleProps extends DatePickerPropsBase {
  mode?: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
}

interface DatePickerRangeProps extends DatePickerPropsBase {
  mode: 'range';
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
}

type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

const formatCaption = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  return `${year}년 ${month}월`;
};

const formatDateDisplay = (
  mode: 'single' | 'range',
  selected: Date | DateRange | undefined,
  placeholder?: string,
): string => {
  if (
    mode === 'range' &&
    selected &&
    typeof selected === 'object' &&
    'from' in selected
  ) {
    const range = selected as DateRange;

    if (!range.from && !range.to) {
      return placeholder || '';
    }

    const from = range.from ? dayjs(range.from).format('YYYY.MM.DD') : '';
    const to = range.to ? dayjs(range.to).format('YYYY.MM.DD') : '';

    if (from && to) {
      return `${from} ~ ${to}`;
    }

    return from || to;
  }

  if (mode === 'single' && selected && selected instanceof Date) {
    return dayjs(selected).format('YYYY.MM.DD');
  }

  return placeholder || '';
};

export function DatePicker(props: DatePickerProps) {
  const { className, disabled, startMonth, endMonth, placeholder } = props;
  const [showCalendar, setShowCalendar] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const commonProps = {
    disabled,
    startMonth,
    endMonth,
    locale: ko,
    formatters: { formatCaption },
    showOutsideDays: true,
    className: cn(
      'bg-background-default rounded-200 !font-designer-14m text-text-subtle p-150',
      className,
    ),
    classNames: {
      month_caption: 'font-designer-14m',
      day: 'size-8',
      day_range_start: 'font-designer-14m',
      day_range_end: 'font-designer-14m',
      selected: 'font-designer-14m',
      months: 'flex flex-col',
      caption_label: 'font-designer-14m',
      nav: 'absolute right-200 flex items-center',
      button_next: 'p-[4px] text-text-strong',
      button_previous: 'p-[4px] text-text-strong',
      head_row: 'flex',
      row: 'flex w-full',
      weekday: 'pt-150',
      week: 'pt-100',
      disabled: 'cursor-not-allowed opacity-50',
    },
    components: {
      Chevron: (
        chevronProps: React.ComponentProps<'svg'> & { orientation?: string },
      ) => {
        if (chevronProps.orientation === 'left') {
          return <ChevronLeft className="size-4" />;
        }

        return <ChevronRight className="size-4" />;
      },
    },
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="rounded-100 border-border-default flex h-[40px] w-[230px] items-center justify-between gap-100 border bg-white px-150"
      >
        <span className="font-designer-14r text-text-subtle">
          {formatDateDisplay(
            props.mode ?? 'single',
            props.selected,
            placeholder,
          )}
        </span>
        <CalendarCheck2 size={16} />
      </button>

      {showCalendar && (
        <div className="rounded-200 border-border-default absolute z-50 mt-50 border shadow-lg">
          {props.mode === 'range' ? (
            <DayPicker
              {...commonProps}
              mode="range"
              selected={props.selected}
              onSelect={props.onSelect}
            />
          ) : (
            <DayPicker
              {...commonProps}
              mode="single"
              selected={props.selected}
              onSelect={props.onSelect}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default DatePicker;
