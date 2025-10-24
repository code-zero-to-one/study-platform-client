import { NextRequest, NextResponse } from 'next/server';
import { addToGoogleSheets, LandingFormData } from '@/shared/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 폼 데이터 유효성 검사
    const { email, type, features, consultation, agreeTerms } = body;

    if (
      !email ||
      !type ||
      !features ||
      !Array.isArray(features) ||
      agreeTerms === undefined
    ) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 },
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 },
      );
    }

    // Google Sheets에 데이터 추가
    const formData: LandingFormData = {
      email,
      type,
      features,
      consultation: consultation || '',
      agreeTerms,
      timestamp: new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    // Google Sheets API 설정이 있는 경우에만 실행
    if (process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      try {
        await addToGoogleSheets(formData);
      } catch (sheetsError) {
        console.error('Google Sheets 저장 실패:', sheetsError);
        // Google Sheets 저장 실패해도 폼 제출은 성공으로 처리
        console.log('폼 데이터 (Google Sheets 저장 실패, 로그만 기록):', formData);
      }
    } else {
      // 환경 변수가 설정되지 않은 경우 콘솔에 로그만 출력
      console.log('폼 데이터 (Google Sheets 설정 없음):', formData);
    }

    return NextResponse.json(
      { message: '신청이 성공적으로 제출되었습니다.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('폼 제출 오류:', error);
    console.error('오류 상세:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    );
  }
}
