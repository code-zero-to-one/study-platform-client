/**
 * 유입경로 추적 유틸리티
 * First-touch attribution을 위해 첫 방문 시 정보를 저장하고,
 * 이후 모든 이벤트에 유입경로 정보를 포함시킵니다.
 */

import { getCookie, setCookie } from '@/shared/tanstack-query/cookie';

const ATTRIBUTION_COOKIE_NAME = 'attribution_data';
const ATTRIBUTION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30일

export interface AttributionData {
  // UTM 파라미터
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  // Referrer 정보
  referrer?: string;
  referrer_domain?: string;

  // GA4 자동 추적 파라미터
  gclid?: string; // Google Ads 클릭 ID

  // 첫 방문 정보
  first_visit_timestamp: string;
  first_visit_path: string;

  // 현재 방문 정보 (업데이트 가능)
  last_visit_timestamp?: string;
  last_visit_path?: string;
}

/**
 * URL에서 UTM 파라미터 추출
 */
function extractUTMParams(
  searchParams: URLSearchParams,
): Partial<AttributionData> {
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmTerm = searchParams.get('utm_term');
  const utmContent = searchParams.get('utm_content');
  const gclid = searchParams.get('gclid');

  const data: Partial<AttributionData> = {};

  if (utmSource) data.utm_source = utmSource;
  if (utmMedium) data.utm_medium = utmMedium;
  if (utmCampaign) data.utm_campaign = utmCampaign;
  if (utmTerm) data.utm_term = utmTerm;
  if (utmContent) data.utm_content = utmContent;
  if (gclid) data.gclid = gclid;

  return data;
}

/**
 * Referrer에서 도메인 추출
 */
function extractReferrerDomain(referrer: string): string | undefined {
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, ''); // www 제거
  } catch {
    return undefined;
  }
}

/**
 * 현재 페이지의 유입경로 정보 수집 및 저장
 * 첫 방문 시에만 저장하고, 이후 방문에서는 업데이트만 수행
 */
export function trackAttribution(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  const searchParams = new URLSearchParams(window.location.search);
  const currentPath = window.location.pathname;
  const currentTimestamp = new Date().toISOString();
  const referrer = document.referrer;

  // 기존 attribution 데이터 확인
  const existingDataStr = getCookie(ATTRIBUTION_COOKIE_NAME);
  let existingData: AttributionData | null = null;

  if (existingDataStr) {
    try {
      existingData = JSON.parse(existingDataStr);
    } catch {
      // 파싱 실패 시 무시
    }
  }

  // UTM 파라미터 추출
  const utmData = extractUTMParams(searchParams);

  // Referrer 정보 추출
  let referrerData: Partial<AttributionData> = {};
  if (referrer && !referrer.startsWith(window.location.origin)) {
    referrerData.referrer = referrer;
    referrerData.referrer_domain = extractReferrerDomain(referrer);
  }

  // 첫 방문인 경우 (UTM 파라미터가 있거나 referrer가 있거나 쿠키가 없는 경우)
  const isFirstVisit =
    !existingData ||
    (Object.keys(utmData).length > 0 && !existingData.utm_source) ||
    (referrerData.referrer && !existingData.referrer);

  let attributionData: AttributionData;

  if (isFirstVisit && !existingData) {
    // 완전히 새로운 방문
    attributionData = {
      ...utmData,
      ...referrerData,
      first_visit_timestamp: currentTimestamp,
      first_visit_path: currentPath,
      last_visit_timestamp: currentTimestamp,
      last_visit_path: currentPath,
    } as AttributionData;
  } else if (isFirstVisit && existingData) {
    // 기존 쿠키는 있지만 새로운 UTM/referrer가 있는 경우 (첫 유입경로 업데이트)
    attributionData = {
      ...existingData,
      ...utmData, // UTM 파라미터가 있으면 업데이트
      ...(referrerData.referrer && !existingData.referrer ? referrerData : {}), // referrer가 없었으면 추가
      last_visit_timestamp: currentTimestamp,
      last_visit_path: currentPath,
    };
  } else if (existingData) {
    // 기존 방문자 - last_visit만 업데이트
    attributionData = {
      ...existingData,
      last_visit_timestamp: currentTimestamp,
      last_visit_path: currentPath,
    };
  } else {
    // 예외 케이스
    attributionData = {
      first_visit_timestamp: currentTimestamp,
      first_visit_path: currentPath,
      last_visit_timestamp: currentTimestamp,
      last_visit_path: currentPath,
    };
  }

  // 쿠키에 저장
  setCookie(ATTRIBUTION_COOKIE_NAME, JSON.stringify(attributionData), {
    maxAge: ATTRIBUTION_COOKIE_MAX_AGE,
    sameSite: 'Lax', // 외부 사이트에서의 리디렉션을 위해 Lax 사용
  });

  return attributionData;
}

/**
 * 저장된 attribution 데이터 조회
 */
export function getAttributionData(): AttributionData | null {
  if (typeof window === 'undefined') return null;

  const dataStr = getCookie(ATTRIBUTION_COOKIE_NAME);
  if (!dataStr) return null;

  try {
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
}

/**
 * GTM 이벤트에 포함할 attribution 파라미터 생성
 */
export function getAttributionParams(): Record<string, string> {
  const attribution = getAttributionData();
  if (!attribution) return {};

  const params: Record<string, string> = {};

  // UTM 파라미터
  if (attribution.utm_source) params.dl_utm_source = attribution.utm_source;
  if (attribution.utm_medium) params.dl_utm_medium = attribution.utm_medium;
  if (attribution.utm_campaign)
    params.dl_utm_campaign = attribution.utm_campaign;
  if (attribution.utm_term) params.dl_utm_term = attribution.utm_term;
  if (attribution.utm_content) params.dl_utm_content = attribution.utm_content;

  // Referrer 정보
  if (attribution.referrer_domain)
    params.dl_referrer_domain = attribution.referrer_domain;

  // Google Ads 클릭 ID
  if (attribution.gclid) params.dl_gclid = attribution.gclid;

  // 첫 방문 정보
  params.dl_first_visit_timestamp = attribution.first_visit_timestamp;
  params.dl_first_visit_path = attribution.first_visit_path;

  return params;
}
