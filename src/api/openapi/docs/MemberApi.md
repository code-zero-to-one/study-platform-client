# MemberApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**autoMatchMember**](#automatchmember) | **PATCH** /api/v1/members/{memberId}/auto-matching | [메인: 스터디 신청을 완료한 사용자] 자동 매칭 On/Off|
|[**findStudyReservations**](#findstudyreservations) | **GET** /api/v1/members/study-reservation | 스터디 예정 회원 목록 조회|
|[**getParticipatingStudies**](#getparticipatingstudies) | **GET** /api/v1/members/{memberId}/studies | 회원의 참여 스터디 조회|
|[**signUp**](#signup) | **POST** /api/v1/members | [회원가입/로그인 팝업] 회원가입|

# **autoMatchMember**
> BaseResponse autoMatchMember()

회원의 자동 매칭 여부를 켜거나 끌 수 있습니다.

### Example

```typescript
import {
    MemberApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let autoMatching: boolean; //true일 경우 자동매칭 On, false일 경우 자동매칭 Off (default to undefined)
let memberId: number; // (default to undefined)

const { status, data } = await apiInstance.autoMatchMember(
    autoMatching,
    memberId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **autoMatching** | [**boolean**] | true일 경우 자동매칭 On, false일 경우 자동매칭 Off | defaults to undefined|
| **memberId** | [**number**] |  | defaults to undefined|


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 자동매칭 여부 변경 성공 |  -  |
|**404** | memberId에 해당하는 회원이 없을 경우 |  -  |
|**409** | 스터디를 신청하지 않았는데 자동 매칭을 On으로 업데이트 시도할 경우 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findStudyReservations**
> StudyReservationSchema findStudyReservations()

다음 스터디 참가 예정인 회원 목록을 조회합니다.

### Example

```typescript
import {
    MemberApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let cursor: number; //cursor를 기준으로 다음 N개의 데이터를 불러옵니다. 여기서 cursor는 memberId입니다. (optional) (default to undefined)
let pageSize: number; //불러올 데이터의 개수입니다. (optional) (default to 50)
let firstMemberId: number; //가장 먼저 불러올 회원의 ID (optional) (default to undefined)

const { status, data } = await apiInstance.findStudyReservations(
    cursor,
    pageSize,
    firstMemberId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **cursor** | [**number**] | cursor를 기준으로 다음 N개의 데이터를 불러옵니다. 여기서 cursor는 memberId입니다. | (optional) defaults to undefined|
| **pageSize** | [**number**] | 불러올 데이터의 개수입니다. | (optional) defaults to 50|
| **firstMemberId** | [**number**] | 가장 먼저 불러올 회원의 ID | (optional) defaults to undefined|


### Return type

**StudyReservationSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**0** | 스터디 예정 회원 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getParticipatingStudies**
> ParticipatingStudyResponseSchema getParticipatingStudies()

회원이 참여한 스터디를 조회합니다.

### Example

```typescript
import {
    MemberApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let memberId: number; //회원의 ID (default to undefined)
let studyType: 'BOTH' | 'GROUP_STUDY' | 'ONE_ON_ONE_STUDY'; //스터디 타입 (일대일 스터디 or 그룹스터디) - BOTH: 둘 다 응답 / GROUP_STUDY: 그룹스터디만 응답 / ONE_ON_ONE_STUDY: 일대일 스터디만 응답 (optional) (default to 'BOTH')
let studyStatus: 'BOTH' | 'NOT_COMPLETED' | 'COMPLETED'; //스터디 상태 (미완 or 완료) - BOTH: 둘 다 등답 / NOT_COMPLETED: 완료되지 않은 스터디만 응답 / COMPLETED: 완료된 스터디만 응답 (optional) (default to 'BOTH')
let inProgressPage: number; //진행 중인 스터디 pagination (1부터 시작) (optional) (default to 1)
let inProgressPageSize: number; //진행 중인 스터디 페이지 크기 (optional) (default to 3)
let completedPage: number; //완료된 스터디 pagination (1부터 시작) (optional) (default to 1)
let completedPageSize: number; //완료된 스터디 페이지 크기 (optional) (default to 6)

const { status, data } = await apiInstance.getParticipatingStudies(
    memberId,
    studyType,
    studyStatus,
    inProgressPage,
    inProgressPageSize,
    completedPage,
    completedPageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberId** | [**number**] | 회원의 ID | defaults to undefined|
| **studyType** | [**&#39;BOTH&#39; | &#39;GROUP_STUDY&#39; | &#39;ONE_ON_ONE_STUDY&#39;**]**Array<&#39;BOTH&#39; &#124; &#39;GROUP_STUDY&#39; &#124; &#39;ONE_ON_ONE_STUDY&#39;>** | 스터디 타입 (일대일 스터디 or 그룹스터디) - BOTH: 둘 다 응답 / GROUP_STUDY: 그룹스터디만 응답 / ONE_ON_ONE_STUDY: 일대일 스터디만 응답 | (optional) defaults to 'BOTH'|
| **studyStatus** | [**&#39;BOTH&#39; | &#39;NOT_COMPLETED&#39; | &#39;COMPLETED&#39;**]**Array<&#39;BOTH&#39; &#124; &#39;NOT_COMPLETED&#39; &#124; &#39;COMPLETED&#39;>** | 스터디 상태 (미완 or 완료) - BOTH: 둘 다 등답 / NOT_COMPLETED: 완료되지 않은 스터디만 응답 / COMPLETED: 완료된 스터디만 응답 | (optional) defaults to 'BOTH'|
| **inProgressPage** | [**number**] | 진행 중인 스터디 pagination (1부터 시작) | (optional) defaults to 1|
| **inProgressPageSize** | [**number**] | 진행 중인 스터디 페이지 크기 | (optional) defaults to 3|
| **completedPage** | [**number**] | 완료된 스터디 pagination (1부터 시작) | (optional) defaults to 1|
| **completedPageSize** | [**number**] | 완료된 스터디 페이지 크기 | (optional) defaults to 6|


### Return type

**ParticipatingStudyResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 회원이 참여한 스터디 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **signUp**
> signUp(memberCreationRequestDto)

회원가입을 진행하는 엔드포인트 - nickname: 필수, 2~20자 한글/영문/숫자, 특수문자 불가 (중복 체크 필수) - loginId: 선택(소셜 로그인 시 비움), 일반 로그인용 식별자 - jobs: 선택, Enum 리스트 (최대 5개) 값 = [IT_NOBASE_BUSINESS_STARTUP, IT_NOBASE_AUTOMATION, IT_NOBASE_MY_SERVICE, IT_PRACTITIONER_PM_PO_PLANNING, IT_PRACTITIONER_FRONTEND, IT_PRACTITIONER_BACKEND, IT_PRACTITIONER_AI_ML, IT_PRACTITIONER_IOS, IT_PRACTITIONER_ANDROID, IT_PRACTITIONER_DEVOPS, IT_PRACTITIONER_DATA_ANALYSIS, IT_PRACTITIONER_QA, IT_PRACTITIONER_GAME_DEV, IT_PRACTITIONER_DESIGN, IT_PRACTITIONER_MARKETING, IT_PRACTITIONER_ETC] - career: 선택, Enum 값 = [BEGINNER, JOB_SEEKER, JUNIOR, MIDDLE, SENIOR] - studyFormatTypes: 선택, Enum 값 = [PROJECT, MENTORING, SEMINAR, CHALLENGE, BOOK_LECTURE] - goal: 선택, 자유 텍스트 입력(최대 100자) - imageExtension: 선택, Enum 값 = [DEFAULT, JPG, PNG, GIF, WEBP, SVG, JPEG] 

### Example

```typescript
import {
    MemberApi,
    Configuration,
    MemberCreationRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new MemberApi(configuration);

let memberCreationRequestDto: MemberCreationRequestDto; //

const { status, data } = await apiInstance.signUp(
    memberCreationRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **memberCreationRequestDto** | **MemberCreationRequestDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 회원가입 성공. \&quot;content\&quot; 필드에는 자동 생성된 회원의 ID가 나타난다. |  -  |
|**409** | 중복된 회원 등록 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

