# Mentoring Backend API Spec (Position/Keyword Source of Truth)

작성일: 2026-03-03  
작성 목적: 멘토 등록/목록/상세에서 사용하는 `직군/직무/경력/핵심키워드`를 프론트 하드코딩 없이 백엔드 단일 소스로 관리

## 1. 배경
- 현재 멘토 포지션 관련 값(직군/직무/경력/핵심키워드)이 프론트 상수/목데이터에 섞여 있음.
- 서비스 운영 시 값 변경(신규 직무 추가, 라벨 변경, 비활성화)을 배포 없이 처리할 수 있어야 함.
- 멘토 등록에서 선택한 값이 목록/상세에 동일하게 노출되어야 하며, 값 해석 책임은 백엔드가 가져야 함.

## 2. 요구사항
- `직군(jobGroup)`, `직무(jobTitle)`, `경력(career)`, `핵심키워드(coreKeyword)`는 백엔드에서 관리.
- 프론트는 코드값(code)만 저장/전송하고, 노출 라벨(label)은 응답값 사용.
- 멘토 등록 저장 시 유효성(직군-직무 매핑, 키워드 허용 범위)은 백엔드가 검증.
- 목록/상세/내 설정 응답에 라벨이 포함되어 프론트 fallback 없이 바로 렌더링 가능해야 함.

## 3. 신규 조회 API (필수)
### `GET /api/v1/mentors/registration/options`
멘토 등록/수정 화면에 필요한 모든 선택값을 한 번에 반환.

#### Query
- `includeInactive` (optional, boolean, default: `false`)

#### Response (200)
```json
{
  "statusCode": 200,
  "timestamp": "2026-03-03T12:00:00Z",
  "content": {
    "maxCoreKeywordCount": 5,
    "jobGroups": [
      {
        "code": "DEVELOPMENT",
        "label": "개발",
        "displayOrder": 1,
        "active": true
      }
    ],
    "jobTitles": [
      {
        "code": "BACKEND_SERVER_DEVELOPER",
        "jobGroupCode": "DEVELOPMENT",
        "label": "백엔드/서버 개발자",
        "displayOrder": 1,
        "active": true
      }
    ],
    "careers": [
      {
        "code": "JUNIOR_1_3",
        "label": "주니어 (1년 ~ 3년)",
        "minYears": 1,
        "maxYears": 3,
        "displayOrder": 1,
        "active": true
      }
    ],
    "coreKeywords": [
      {
        "code": "RESUME",
        "label": "이력서",
        "jobGroupCodes": ["DEVELOPMENT"],
        "jobTitleCodes": [],
        "displayOrder": 1,
        "active": true
      }
    ]
  },
  "message": null
}
```

## 3-1. 초기 마스터 데이터 전체값 (필수)
아래는 프론트 기존 등록폼 기준으로 정리한 **초기 전체값**이며, 백엔드가 코드/라벨을 확정해 관리해야 함.

### Job Group (직군)
| code | label |
| --- | --- |
| `DEVELOPMENT` | 개발 |
| `GAME_DEVELOPMENT` | 게임개발 |
| `DESIGN` | 디자인 |
| `PLANNING` | 기획 |
| `MARKETING` | 마케팅 |
| `BUSINESS_HR` | 경영인사 |
| `SALES` | 영업 |
| `ENGINEERING` | 엔지니어링 |

### Career (경력)
| code | label | minYears | maxYears |
| --- | --- | --- | --- |
| `JUNIOR_1_3` | 주니어 (1년 ~ 3년) | `1` | `3` |
| `MIDDLE_4_7` | 미들 (4년 ~ 7년) | `4` | `7` |
| `SENIOR_8_11` | 시니어 (8년 ~ 11년) | `8` | `11` |
| `TECH_LEAD_12_PLUS` | 테크리드 (12년 이상) | `12` | `null` |

#### Career 상세 규칙 (필수)
- 저장 요청은 `careerCode`만 허용하고 라벨 문자열(`careerYears`) 저장은 금지.
- `minYears`, `maxYears`는 모두 포함 구간(inclusive) 기준.
- `maxYears = null`은 상한 없는 구간(예: 12년 이상)을 의미.
- 등록/수정/조회 응답의 `career` 객체는 최소 `code`, `label`, `minYears`, `maxYears`를 포함.
- 백엔드 연차 산정 단위는 `년(정수)`로 고정.

### Core Keyword (핵심키워드)
| code | label |
| --- | --- |
| `REACT` | React |
| `TYPESCRIPT` | TypeScript |
| `NEXT_JS` | Next.js |
| `NODE_JS` | Node.js |
| `SPRING` | Spring |
| `PYTHON` | Python |
| `INTERVIEW` | 면접 |
| `RESUME` | 이력서 |
| `PORTFOLIO` | 포트폴리오 |
| `CAREER` | 커리어 |

#### Core Keyword 상세 규칙 (필수)
- 멘토 등록/수정 화면의 핵심키워드 UI는 반드시 `GET /api/v1/mentors/registration/options`의 `content.coreKeywords`를 사용.
- 프론트 상수/목데이터(`MENTOR_SKILL_TAG_PRESETS` 등)로 키워드 목록을 구성하지 않음.
- 저장 요청(`PUT /api/v1/mentors/me`)은 `coreKeywordCodes: string[]`만 전송하고 라벨 문자열 배열은 전송하지 않음.
- 선택 가능 최대 개수는 옵션 응답의 `maxCoreKeywordCount`를 사용.
- `coreKeywords[].active !== true`인 값은 등록 화면에서 노출/선택 불가.
- `coreKeywords[].jobGroupCodes` 또는 `jobTitleCodes`가 비어있지 않으면 선택한 직군/직무와 매칭되는 값만 선택 가능.
- 목록/상세/내 설정 응답은 `coreKeywords: [{ code, label }]`를 내려 프론트 로컬 매핑 없이 그대로 렌더링.
- 옵션 API 실패 시 키워드 폴백 렌더링 금지(등록 진입 차단).

### Job Title (직무)
저장값은 아래 직무만 허용. `선택`은 UI placeholder 이므로 API 저장값에서 제외.

#### DEVELOPMENT (개발)
| code | label |
| --- | --- |
| `BACKEND_SERVER_DEVELOPER` | 백엔드/서버 개발자 |
| `FRONTEND_WEB_PUBLISHER` | 프론트엔드/웹퍼블리셔 |
| `SOFTWARE_ENGINEER` | SW 엔지니어 |
| `ANDROID_DEVELOPER` | 안드로이드 개발자 |
| `IOS_DEVELOPER` | iOS 개발자 |
| `CROSS_PLATFORM_APP_DEVELOPER` | 크로스플랫폼 앱 개발자 |
| `DATA_ENGINEER` | 데이터 엔지니어 |
| `DATA_SCIENTIST` | 데이터 사이언티스트 |
| `DATA_ANALYST` | 데이터 분석가 |
| `MACHINE_LEARNING_ENGINEER` | 머신러닝 엔지니어 |
| `DBA` | DBA |
| `DEVOPS` | DevOps |
| `SYSTEM_NETWORK_ADMINISTRATOR` | 시스템/네트워크 관리자 |
| `QA_TEST_ENGINEER` | QA/테스트엔지니어 |
| `TECH_SUPPORT` | 기술지원 |
| `SECURITY_ENGINEER` | 보안 엔지니어 |
| `BLOCKCHAIN_ENGINEER` | 블록체인 엔지니어 |
| `EMBEDDED_HW_ENGINEER` | HW/임베디드 엔지니어 |
| `AGILE_SCRUM_MASTER` | 애자일/스크럼 마스터 |
| `CTO_TECHNICAL_DIRECTOR` | CTO/테크니컬 디렉터 |

#### GAME_DEVELOPMENT (게임개발)
| code | label |
| --- | --- |
| `GAME_SERVER_DEVELOPER` | 게임 서버 개발자 |
| `GAME_CLIENT_DEVELOPER` | 게임 클라이언트 개발자 |
| `GAME_PLANNER` | 게임 기획자 |
| `GAME_GRAPHIC_DESIGNER` | 게임 그래픽 디자이너 |
| `GAME_ARTIST` | 게임 아티스트 |
| `MOBILE_GAME_DEVELOPER` | 모바일 게임 개발자 |
| `GAME_OPERATOR` | 게임 운영자 |

#### DESIGN (디자인)
| code | label |
| --- | --- |
| `PRODUCT_DESIGNER` | 프로덕트 디자이너 |
| `WEB_APP_DESIGNER` | 웹/앱 디자이너 |
| `GRAPHIC_DESIGNER` | 그래픽 디자이너 |
| `BI_BX_DESIGNER` | BI/BX 디자이너 |
| `AD_DESIGNER` | 광고 디자이너 |
| `VIDEO_MOTION_DESIGNER` | 영상/모션 디자이너 |
| `OPERATIONS_DESIGNER` | 운영 디자이너 |

#### PLANNING (기획)
| code | label |
| --- | --- |
| `SERVICE_PLANNER` | 서비스 기획자 |
| `PO_PM` | PO/PM |
| `BUSINESS_ANALYST` | 비즈니스 분석가 |
| `BUSINESS_DEVELOPMENT_PLANNER` | 사업개발/기획자 |
| `STRATEGY_PLANNER` | 전략 기획자 |
| `GLOBAL_BUSINESS_DEVELOPMENT_PLANNER` | 해외 사업개발/기획자 |
| `PRODUCT_PLANNER_MD` | 상품 기획자/MD |

#### MARKETING (마케팅)
| code | label |
| --- | --- |
| `PERFORMANCE_MARKETER` | 퍼포먼스 마케터 |
| `CONTENT_MARKETER` | 콘텐츠 마케터 |
| `DIGITAL_MARKETER` | 디지털 마케터 |
| `MARKETING_PLANNER` | 마케팅 기획자 |
| `BRAND_MARKETER` | 브랜드 마케터 |
| `AD_PLANNER` | 광고 기획자 |
| `CRM_SPECIALIST` | CRM 전문가 |
| `COPYWRITER_UX_WRITER` | 카피라이터/UX Writer |

#### BUSINESS_HR (경영인사)
| code | label |
| --- | --- |
| `BUSINESS_SUPPORT` | 경영지원 |
| `ACCOUNTING` | 회계/경리 |
| `ORGANIZATION_MANAGEMENT` | 조직관리 |
| `INFORMATION_SECURITY_MANAGER` | 정보보호 담당자 |
| `HR_EVALUATION` | 인사/평가 |
| `LEARNING_DEVELOPMENT` | 교육 |
| `RECRUITER` | 채용담당자 |
| `SERVICE_OPERATIONS` | 서비스 운영 |
| `CS_MANAGER` | CS 매니저 |

#### SALES (영업)
| code | label |
| --- | --- |
| `B2B_SALES` | 기업영업 |
| `SALES_MANAGER` | 영업 관리자 |
| `TECHNICAL_SALES` | 기술영업 |
| `SOLUTION_CONSULTANT` | 솔루션 컨설턴트 |
| `SALES_REPRESENTATIVE` | 세일즈 |

#### ENGINEERING (엔지니어링)
| code | label |
| --- | --- |
| `MECHANICAL_ENGINEER` | 기계 엔지니어 |
| `ELECTRONICS_ENGINEER` | 전자 엔지니어 |
| `ELECTRICAL_ENGINEER` | 전기 엔지니어 |
| `ROBOTICS_AUTOMATION_ENGINEER` | 로봇·자동화 |
| `CAD_3D_DESIGNER` | CAD·3D 설계자 |
| `PRODUCT_ENGINEER` | 제품 엔지니어 |
| `CONTROL_ENGINEER` | 제어 엔지니어 |
| `FIELD_EQUIPMENT_ENGINEER` | 장비 엔지니어 |
| `ELECTROMECHANICAL_ENGINEER` | 전기기계 공학자 |
| `FACILITY_ENGINEER` | 설비 엔지니어 |
| `PROCESS_ENGINEER` | 공정 엔지니어 |

## 4. 기존 저장 API 변경 (필수)
### `PUT /api/v1/mentors/me`

#### 요청 필드 변경
- 기존 문자열 필드
  - `jobGroup` (string label)
  - `jobTitle` (string label)
  - `careerYears` (string label)
  - `skillTags` (string[] label)
- 변경 후 코드 기반 필드
  - `jobGroupCode` (string)
  - `jobTitleCode` (string)
  - `careerCode` (string)
  - `coreKeywordCodes` (string[])

#### `careerCode` 허용값 (enum)
- `JUNIOR_1_3`
- `MIDDLE_4_7`
- `SENIOR_8_11`
- `TECH_LEAD_12_PLUS`

#### 예시 Request
```json
{
  "contactEmail": "mentor@example.com",
  "categories": ["CAREER"],
  "mentoringTitle": "백엔드 커리어 멘토링",
  "appealLine": "면접/이력서 실전 피드백",
  "jobGroupCode": "DEVELOPMENT",
  "jobTitleCode": "BACKEND_SERVER_DEVELOPER",
  "careerCode": "JUNIOR_1_3",
  "coreKeywordCodes": ["RESUME", "INTERVIEW", "CAREER"],
  "companyCategory": "네카라쿠배",
  "companyName": "OO회사",
  "hideCompanyName": false,
  "maxParticipants": 1,
  "methods": [
    { "type": "NOTE", "enabled": true, "price": 3000 },
    { "type": "SIMPLE", "enabled": true, "price": 10000, "durationMinutes": 15 }
  ],
  "schedule": {
    "timezone": "Asia/Seoul",
    "slotUnitMinutes": 30,
    "weekly": {
      "mon": ["21:00"],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    }
  },
  "detailedDescription": "...",
  "interviewQuestions": [],
  "preNotice": ""
}
```

## 5. 기존 조회 API 응답 보강 (필수)
대상:
- `GET /api/v1/mentors`
- `GET /api/v1/mentors/{mentorId}`
- `GET /api/v1/mentors/me`

### 응답에 반드시 포함
```json
{
  "profile": {
    "jobGroup": { "code": "DEVELOPMENT", "label": "개발" },
    "jobTitle": { "code": "BACKEND_SERVER_DEVELOPER", "label": "백엔드/서버 개발자" },
    "career": {
      "code": "JUNIOR_1_3",
      "label": "주니어 (1년 ~ 3년)",
      "minYears": 1,
      "maxYears": 3
    },
    "coreKeywords": [
      { "code": "RESUME", "label": "이력서" },
      { "code": "INTERVIEW", "label": "면접" }
    ]
  }
}
```

### 5-1. 멘토 목록 조회 경력 필터 계약 (필수)
Endpoint: `GET /api/v1/mentors`

#### Query
- `careerCodes` (optional, string[], 반복 쿼리 방식)
  - 예시: `/api/v1/mentors?careerCodes=JUNIOR_1_3&careerCodes=MIDDLE_4_7`

#### 규칙
- `careerCodes` 미전달 시 경력 전체 대상 조회.
- `careerCodes` 전달 시 해당 코드 중 하나라도 일치하면 목록에 포함(OR 조건).
- 알 수 없는 `careerCode` 전달 시 `422` + `MENTOR_OPTION_004` 반환.

## 6. 서버 검증 규칙
- `jobGroupCode`는 활성값이어야 함.
- `jobTitleCode`는 활성값이어야 하며, 선택한 `jobGroupCode` 소속이어야 함.
- `careerCode`는 필수이며 활성값이어야 함.
- `coreKeywordCodes`는 중복 불가.
- `coreKeywordCodes.length <= maxCoreKeywordCount`.
- 비활성 코드 저장 요청 시 `422` 반환.

## 7. 에러 코드 제안
- `MENTOR_OPTION_001`: INVALID_JOB_GROUP_CODE
- `MENTOR_OPTION_002`: INVALID_JOB_TITLE_CODE
- `MENTOR_OPTION_003`: JOB_TITLE_NOT_IN_JOB_GROUP
- `MENTOR_OPTION_004`: INVALID_CAREER_CODE
- `MENTOR_OPTION_005`: INVALID_CORE_KEYWORD_CODE
- `MENTOR_OPTION_006`: CORE_KEYWORD_COUNT_EXCEEDED

## 8. 프론트 적용 기준
- 프론트는 등록 폼 렌더링 시 반드시 `GET /mentors/registration/options`를 선호 데이터 소스로 사용.
- 옵션 응답 실패 시 멘토 등록 진입 차단(하드코딩 fallback 금지).
- 목록/상세는 응답의 `code + label`만 표시하며 로컬 매핑 테이블 미사용.
- `GET /mentors/me`는 `content.registered`를 필수 분기 기준으로 사용:
  - `registered=true`면 `content.mentorId`(number), `content.settings`(object) 필수
  - `registered=false`면 미등록으로 처리 (`mentorId/settings`는 `null` 허용)
- `/mentors/me` 파싱은 strict 모드로 동작하며 `content.mentor` fallback을 사용하지 않음.
- `/mentors/me` 에러 처리 정책:
  - `403/404`는 미등록(`not_found`)으로 처리
  - `5xx` 및 계약 파싱 오류는 에러로 유지 (등록 화면은 차단, 상세 화면은 본문 유지 + 수정 버튼 숨김)
