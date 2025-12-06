import { google } from 'googleapis';

// Google Sheets API 설정
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID || '';
const RANGE = 'A:G'; // A부터 G열까지 사용 (시트 이름 없이)

// Google Sheets API 클라이언트 초기화
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: 'v4', auth });

  return sheets;
}

// 폼 데이터 타입 정의
export interface LandingFormData {
  email: string;
  type: string;
  experience: string;
  features: string[];
  consultation: string;
  agreeTerms: boolean;
  timestamp: string;
}

// Google Sheets에 데이터 추가
export async function addToGoogleSheets(data: LandingFormData): Promise<void> {
  try {
    const sheets = await getSheetsClient();

    // 헤더가 없는 경우 헤더 추가
    const headerRange = 'A1:G1';
    const headerValues = [
      [
        '이메일',
        '직무 유형',
        '경력',
        '관심 기능',
        '상담 내용',
        '개인정보 동의',
        '신청 시간',
      ],
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: headerRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: headerValues,
      },
    });

    // 데이터 추가
    const values = [
      [
        data.email,
        data.type,
        data.experience,
        data.features.join(', '),
        data.consultation,
        data.agreeTerms ? '동의' : '비동의',
        data.timestamp,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
  } catch (error) {
    console.error('Google Sheets API 오류:', error);
    console.error('오류 상세:', error);
    if (error instanceof Error) {
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
    }
    throw new Error(
      `데이터 저장에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// 스프레드시트 존재 여부 확인
export async function checkSpreadsheetExists(): Promise<boolean> {
  try {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    return true;
  } catch (error) {
    console.error('스프레드시트 확인 오류:', error);

    return false;
  }
}
