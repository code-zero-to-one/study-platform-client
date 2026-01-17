import {
  addDays,
  addHours,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
  getDay,
  parseISO,
  startOfWeek,
} from 'date-fns';

// todo: formatToKST로 통일하도록 리팩토링 필요 (getKoreaDate와 혼용 중)
/**
 * 날짜 문자열을 한국시간 Date 객체로 변환
 * - UTC 문자열이면 +9시간
 * - 이미 KST면 그대로 사용
 */
export const formatToKST = (dateString?: string): Date | undefined => {
  if (!dateString) {
    return undefined;
  }

  const date = parseISO(dateString);

  // UTC 여부 판단
  // 1) Z 포함 → UTC
  // 2) +00:00 포함 → UTC
  const isUTC = dateString.endsWith('Z') || dateString.includes('+00:00');

  const kstDate = isUTC ? addHours(date, 9) : date;

  return kstDate;
};

export const getKoreaDate = (targetDate?: Date) => {
  const date = targetDate || new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000; // 1970년 1월 1일로부터 현재까지 지난 시간 (밀리초)

  const koreaTimeDiff = 9 * 60 * 60 * 1000; // 한국은 UTC보다 9시간 빠름

  const koreaNow = new Date(utc + koreaTimeDiff);

  return koreaNow;
};

export const formatYYYYMMDD = (
  dateString: string,
  separator: 'dash' | 'dot' = 'dash',
) => {
  const onlyDate = new Date(dateString).toISOString().slice(0, 10);

  return onlyDate.replace(/-/g, separator === 'dash' ? '-' : '.');
};

export const formatHHMM = (dateString: string) => {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

export const formatKoreaYMD = (targetDate?: Date) =>
  format(getKoreaDate(targetDate), 'yyyy-MM-dd');

export const formatKoreaRelativeTime = (targetDateStr: string): string => {
  const targetDate = parseISO(targetDateStr);
  const koreaTarget = getKoreaDate(targetDate); // 한국 시간 변환
  const koreaNow = getKoreaDate();

  const minutes = differenceInMinutes(koreaNow, koreaTarget);

  if (minutes < 1) return '방금 전'; // 1분 미만이면 "방금 전"
  if (minutes < 60) return `${minutes}분 전`; // 60분 미만이면 "n분 전"

  const hours = differenceInHours(koreaNow, koreaTarget);
  if (hours < 24) return `${hours}시간 전`; // 24시간 미만이면 "n시간 전"

  const days = differenceInDays(koreaNow, koreaTarget);
  if (days < 30) return `${days}일 전`; // 30일 미만이면 "n일 전"

  return targetDateStr;
};

export const getKoreaDisplayMonday = (base?: Date) => {
  const todayKST = getKoreaDate(base);
  const monday = startOfWeek(todayKST, { weekStartsOn: 1 }); // 월요일 시작
  const dow = getDay(todayKST); // 0=일, 6=토

  return dow === 0 || dow === 6 ? addDays(monday, 7) : monday;
};

interface MissionPeriod {
  missionId?: number;
  startDate?: string;
  endDate?: string;
}

interface CreateMissionDateDisabledMatcherOptions {
  studyStartDate?: string;
  studyEndDate?: string;
  existingMissions?: MissionPeriod[];
  excludeMissionId?: number;
}

export const createMissionDateDisabledMatcher = (
  options: CreateMissionDateDisabledMatcherOptions,
) => {
  const { studyStartDate, studyEndDate, existingMissions, excludeMissionId } = options;

  return (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (normalizedDate < today) {
      return true;
    }

    if (studyStartDate) {
      const startDate = new Date(studyStartDate);
      startDate.setHours(0, 0, 0, 0);
      if (normalizedDate < startDate) {
        return true;
      }
    }

    if (studyEndDate) {
      const endDate = new Date(studyEndDate);
      endDate.setHours(0, 0, 0, 0);
      if (normalizedDate > endDate) {
        return true;
      }
    }

    if (existingMissions) {
      const targetTime = normalizedDate.getTime();
      for (const mission of existingMissions) {
        if (excludeMissionId && mission.missionId === excludeMissionId) continue;

        if (mission.startDate && mission.endDate) {
          const missionStart = new Date(mission.startDate);
          missionStart.setHours(0, 0, 0, 0);
          const missionEnd = new Date(mission.endDate);
          missionEnd.setHours(0, 0, 0, 0);

          if (
            targetTime >= missionStart.getTime() &&
            targetTime <= missionEnd.getTime()
          ) {
            return true;
          }
        }
      }
    }

    return false;
  };
};
