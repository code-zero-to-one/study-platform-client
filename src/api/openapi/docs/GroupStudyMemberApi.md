# GroupStudyMemberApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getGroupStudyMembers**](#getgroupstudymembers) | **GET** /api/v1/group-studies/{id}/members | 참여자 목록 조회|
|[**getMemberStatus**](#getmemberstatus) | **GET** /api/v1/group-studies/{id}/members/status | 그룹스터디 회원의 현재 상태 및 사유 조회|
|[**getProgressGrades**](#getprogressgrades) | **GET** /api/v1/group-studies/members/progress-grades | 진행 점수 등급 목록 조회|
|[**kickMember**](#kickmember) | **DELETE** /api/v1/group-studies/{id}/members | 참여자 탈퇴/추방|
|[**updateGreeting**](#updategreeting) | **PUT** /api/v1/group-studies/{id}/members/greeting | 가입인사 등록/수정|
|[**updateMemberProgress**](#updatememberprogress) | **PUT** /api/v1/group-studies/{id}/members/progress | 진행 점수 부여/수정|

# **getGroupStudyMembers**
> getGroupStudyMembers()

작성일자: 2025-09-28  작성자: 성효빈  ## Description  - 그룹 스터디의 사용자 목록을 조회합니다.  - 진행률 내림차순, 참여일시 오름차순으로 정렬됩니다.  - **현재 로그인 사용자는 최상단에 한 번 더 표시**됩니다(ranking: 0).      - 현재 로그인 사용자가 리더이면서 참여자가 아닌 경우에는 제외됩니다.  - **랭킹 1·2·3위 사용자는 모든 페이지 응답에 포함**됩니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | id(path) | number | 그룹 스터디 ID | Y | 1 | | isPaging | boolean | 페이지네이션 사용 여부 | N | default: true | | pageSize | number | 페이지 크기 | N | default: 5 | | pageNumber | number | 페이지 번호(1부터) | N | default: 1 |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-08-17T12:08:35.54579\" | | content | object | 응답 본문 | { ... } | | message | string | 처리 결과 | \"그룹 스터디 참여자 목록 조회 성공\" |  ---  ### Response > content  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | pageSize | number | 페이지 크기 | 5 | | pageNumber | number | 현재 페이지 | 1 | | totalElements | number | 총 아이템 수(명예의 전당 제외) | 127 | | totalMemberCount | number | 총 참여자 수 | 130 | | hasPrevious | boolean | 이전 페이지 존재 여부 | true / false | | hasNext | boolean | 다음 페이지 존재 여부 | true / false | | members | array | 현재 페이지의 사용자 목록 | [ ... ] |  ---  ### Response > content > members  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | id | number | 사용자 ID | 1 | | profileImageUrl | string | 프로필 이미지 URL | \"[https://test-api.zeroone.it.kr/profile-image/db8aaf70-7791-4134-9ea1-98b774b12056_1755342010720.webp\"](https://api.zeroone.it.kr/profile-image/db8aaf70-7791-4134-9ea1-98b774b12056_1755342010720.webp) | | memberName | string | 이름 | \"성효빈\" | | tel | string | 전화번호 | \"010-1234-5678\" | | progress | object | 진행률 정보 | { ... } | | ranking | number | 랭킹 | 12 | | greeting | string | 가입인사 내용 | \"안녕하세요. 20자 이상이어야 합니다. 가나다라마바사\" | | lastAccessedAt | string(datetime) | 마지막 접속 일시 | \"2025-10-07T15:04:04\" |  ---  ### Response > content > members > progress  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | score | number | 진행 점수 | 75.5 | | progressHistory | array | 진행 점수 획득 내역 | [ ... ] |  ---  ### Response > content > members > progress > progressHistory  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | id | number | 획득 내역 ID | 1 | | acquiredAt | string(datetime) | 획득 일시 | \"2025-09-15 21:34:10\" | | grade | object | 획득 등급 | { ... } | | reason | string | 사유(성공한 Task) | \"PR 리뷰 3건 완료\" |  ### Response > content > members > progress > progressHistory > grade  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | id | number | 등급 ID | 1 | | code | string | 등급 코드 | \"A+\" | | name | string | 등급명 | \"Great\" | | score | number | 등급 점수 | 4.5 | 

### Example

```typescript
import {
    GroupStudyMemberApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyMemberApi(configuration);

let id: number; //그룹 스터디 ID (default to undefined)
let isPaging: boolean; //페이지네이션 사용 여부 (optional) (default to true)
let pageSize: number; //페이지 크기 (optional) (default to undefined)
let pageNumber: number; //페이지 번호(1부터) (optional) (default to undefined)

const { status, data } = await apiInstance.getGroupStudyMembers(
    id,
    isPaging,
    pageSize,
    pageNumber
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | 그룹 스터디 ID | defaults to undefined|
| **isPaging** | [**boolean**] | 페이지네이션 사용 여부 | (optional) defaults to true|
| **pageSize** | [**number**] | 페이지 크기 | (optional) defaults to undefined|
| **pageNumber** | [**number**] | 페이지 번호(1부터) | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 그룹 스터디 참여자 목록 조회 성공 |  -  |
|**400** | 클라이언트 요청 오류 |  -  |
|**404** | 리소스 조회 실패 |  -  |
|**500** | 그 외 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMemberStatus**
> getMemberStatus()

작성일자: 2025-10-24  작성자: 성효빈  ---  ## Description  - 그룹스터디 회원의 현재 상태 및 사유를 조회합니다.  - 회원이 아닌 경우 \"NONE\"을 반환합니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | id(path) | number | 그룹스터디 ID | Y | 1 |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-09-28T21:18:45.67890\" | | content | object | 응답 본문 | { ... } | | message | string | 처리 결과 | \"그룹스터디 회원의 현재 상태 및 사유 조회 성공\" |  ---  ### Response > content  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | status | string | 그룹스터디 회원의 현재 상태 | 회원 아님: \"NONE\" / 대기:\"PENDING\" / 승인:\"APPROVED\" / 거절:\"REJECTED\" / 탈퇴:\"EXIT\" / 추방:\"KICKED\" | | reason | string | 사유 | \"마음에 안 들어서 강퇴했습니다.\" | 

### Example

```typescript
import {
    GroupStudyMemberApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyMemberApi(configuration);

let id: number; //그룹스터디 ID (default to undefined)

const { status, data } = await apiInstance.getMemberStatus(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 그룹스터디 회원의 현재 상태 및 사유 조회 성공 |  -  |
|**400** | 클라이언트 요청 오류 |  -  |
|**404** | 그룹스터디 조회 실패 |  -  |
|**500** | 그 외 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getProgressGrades**
> getProgressGrades()

작성일자: 2025-09-28  작성자: 성효빈  ---  ## Description  그룹 스터디에서 사용 가능한 진행 점수 등급 목록을 조회합니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-09-28T21:45:22.12345\" | | content | object | 응답 본문 | { ... } | | message | string | 처리 결과 | \"진행 점수 등급 목록 조회 성공\" |  ---  ### Response > content  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | grades | array | 등급 목록 | [ ... ] |  ### Response > content > grades  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | id | number | 진행 점수 등급 ID | 1 | | code | string | 등급 코드 | \"A+\" | | name | string | 등급명 | \"Great\" | | score | number | 등급 점수 | 4.5 | 

### Example

```typescript
import {
    GroupStudyMemberApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyMemberApi(configuration);

const { status, data } = await apiInstance.getProgressGrades();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 진행 점수 등급 목록 조회 성공 |  -  |
|**400** | 클라이언트 요청 오류 |  -  |
|**404** | 리소스 조회 실패 |  -  |
|**500** | 그 외 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **kickMember**
> kickMember()

작성일자: 2025-09-28  작성자: 성효빈  ---  ## Description  그룹 스터디에서 나가거나, 그룹 스터디 리더가 특정 참여자를 내보냅니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | id(path) | number | 그룹 스터디 ID | Y | 1 | | targetMemberId | number | 대상자 ID | Y | 101 | | reason | string | 사유 | Y | 그룹 스터디 리더가 특정 참여자를 내보냅니다. |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-09-28T21:18:45.67890\" | | content | string | 응답 본문 | null | | message | string | 처리 결과 | \"그룹 스터디 참여자 탈퇴 처리 성공\" | 

### Example

```typescript
import {
    GroupStudyMemberApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyMemberApi(configuration);

let id: number; //그룹 스터디 ID (default to undefined)
let targetMemberId: number; //대상자 ID (default to undefined)
let reason: string; //사유 (default to undefined)

const { status, data } = await apiInstance.kickMember(
    id,
    targetMemberId,
    reason
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | 그룹 스터디 ID | defaults to undefined|
| **targetMemberId** | [**number**] | 대상자 ID | defaults to undefined|
| **reason** | [**string**] | 사유 | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 그룹 스터디 참여자 탈퇴 처리 성공 |  -  |
|**400** | 클라이언트 요청 오류 |  -  |
|**402** | 인가 실패 |  -  |
|**404** | 리소스 조회 실패 |  -  |
|**500** | 그 외 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateGreeting**
> updateGreeting(updateGroupStudyMemberGreetingRequest)

작성일자: 2025-09-28  작성자: 성효빈  ---  ## Description  - 그룹 스터디 참여자의 가입인사를 등록하거나 수정합니다.  - 최초 요청 시 생성, 이후 요청 시 수정합니다.  - 길이 제한은 20 <= content.length <= 100 입니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | id(path) | number | 그룹 스터디 ID | Y | 1 | | content | string | 가입인사 내용(20~100자) | Y | \"안녕하세요. 20자 이상이어야 합니다. 가나다라마바사\" |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-09-28T16:22:10.12345\" | | content | string | 응답 본문 | null | | message | string | 처리 결과 | \"가입인사 업데이트 성공\" | 

### Example

```typescript
import {
    GroupStudyMemberApi,
    Configuration,
    UpdateGroupStudyMemberGreetingRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyMemberApi(configuration);

let id: number; //그룹 스터디 ID (default to undefined)
let updateGroupStudyMemberGreetingRequest: UpdateGroupStudyMemberGreetingRequest; //

const { status, data } = await apiInstance.updateGreeting(
    id,
    updateGroupStudyMemberGreetingRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateGroupStudyMemberGreetingRequest** | **UpdateGroupStudyMemberGreetingRequest**|  | |
| **id** | [**number**] | 그룹 스터디 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 가입인사 등록/수정 성공 |  -  |
|**400** | 가입인사 내용 길이 유효성 검사 실패 |  -  |
|**404** | 리소스 조회 실패 |  -  |
|**500** | 그 외 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMemberProgress**
> updateMemberProgress(updateGroupStudyMemberProgressRequest)

작성일자: 2025-09-28  작성자: 성효빈  ---  ## Description  - 그룹 스터디 리더가 특정 참여자에게 진행 점수를 부여하거나 수정합니다.  - 최초 요청 시 생성, 이후 요청 시 수정합니다.  ---  ## Request  | **키** | **타입** | **설명** | **필수 여부** | **예시** | | --- | --- | --- | --- | --- | | id(path) | number | 그룹 스터디 ID | Y | 1 | | targetMemberId | number | 대상자 ID | Y | 101 | | gradeId | number | 획득 등급 ID | Y | 1 | | reason | string | 사유 | Y | \"출석\" |  ---  ## Response  | **키** | **타입** | **설명** | **예시** | | --- | --- | --- | --- | | statusCode | number | 상태 코드 | 200: 성공 / 400: 클라이언트 요청 오류 / 401: 인증 실패 / 403: 인가 실패 / 404: 리소스 조회 실패 / 500: 그 외 | | timestamp | string(datetime) | 응답 일시 | \"2025-09-28T20:35:41.12345\" | | content | string | 응답 본문 | null | | message | string | 처리 결과 | \"진행 점수 업데이트 성공\" | 

### Example

```typescript
import {
    GroupStudyMemberApi,
    Configuration,
    UpdateGroupStudyMemberProgressRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyMemberApi(configuration);

let id: number; //그룹 스터디 ID (default to undefined)
let updateGroupStudyMemberProgressRequest: UpdateGroupStudyMemberProgressRequest; //

const { status, data } = await apiInstance.updateMemberProgress(
    id,
    updateGroupStudyMemberProgressRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateGroupStudyMemberProgressRequest** | **UpdateGroupStudyMemberProgressRequest**|  | |
| **id** | [**number**] | 그룹 스터디 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 진행 점수 부여/수정 성공 |  -  |
|**400** | 클라이언트 요청 오류 |  -  |
|**402** | 인가 실패 |  -  |
|**404** | 리소스 조회 실패 |  -  |
|**500** | 그 외 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

