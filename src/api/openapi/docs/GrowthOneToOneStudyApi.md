# GrowthOneToOneStudyApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getHistory**](#gethistory) | **GET** /api/v1/study/daily/history | 1:1 스터디 기록 목록 조회|

# **getHistory**
> OneToOneStudyHistoryPageResponse getHistory()

로그인한 유저의 1:1 스터디 기록을 최신순으로 조회합니다.  [Request] - Query Params:   - page: 페이지 번호 (0부터 시작, 기본 0)   - size: 페이지 당 개수 (기본 20)   - startDate: 조회 시작 날짜 (YYYY-MM-DD, 선택)   - endDate: 조회 종료 날짜 (YYYY-MM-DD, 선택)   - sort: 정렬 기준 (기본: 최신순 createdAt,desc 등)  [Response Data Structure] | Field | Type | Description | |---|---|---| | content | Array | 스터디 기록 목록 | | content[].studyId | Long | 스터디 ID | | content[].title | String | 스터디 제목 | | content[].scheduledAt | LocalDateTime | 스터디 예정 일시 (ISO 8601 형식) | | content[].status | ProgressStatus | 스터디 진행 상태 (PENDING: 대기중, IN_PROGRESS: 진행중, COMPLETE: 완료, ABSENT: 불참) | | content[].studyLink | String | 학습자료 링크 (nullable) | | content[].participation.role | InterViewOrNot | 참여 역할 (INTERVIEWER: 면접관, INTERVIEWEE: 면접자) | | content[].participation.attendance | AttendanceStatus | 역할 수행 여부 (PRESENT: 출석/역할수행, LATE: 지각, ABSENT: 결석/미수행, PENDING: 대기/미정) | | content[].partner.memberId | Long | 파트너 멤버 ID | | content[].partner.nickname | String | 파트너 닉네임 | | content[].partner.profileImageUrl | String | 파트너 프로필 이미지 URL (nullable) | | page | Long | 현재 페이지 번호 (0부터 시작) | | size | Integer | 페이지 크기 | | totalElements | Long | 전체 요소 개수 | | totalPages | Integer | 전체 페이지 수 | | hasNext | Boolean | 다음 페이지 존재 여부 | | hasPrevious | Boolean | 이전 페이지 존재 여부 |  [Enum 값 상세] - status (ProgressStatus):   - PENDING: 스터디가 아직 시작되지 않은 대기 상태   - IN_PROGRESS: 스터디가 현재 진행 중인 상태   - COMPLETE: 스터디가 완전히 종료된 상태   - ABSENT: 스터디가 불참으로 처리된 상태 - participation.attendance (AttendanceStatus):   - PRESENT: 역할을 정상적으로 수행함 (출석)   - LATE: 역할을 수행했으나 지각함   - ABSENT: 역할을 수행하지 않음 (결석/미수행)   - PENDING: 아직 역할 수행 여부가 결정되지 않음 (대기/미정)

### Example

```typescript
import {
    GrowthOneToOneStudyApi,
    Configuration,
    Pageable
} from './api';

const configuration = new Configuration();
const apiInstance = new GrowthOneToOneStudyApi(configuration);

let pageable: Pageable; // (default to undefined)
let page: number; //페이지 번호 (0..N) (optional) (default to 0)
let size: number; //페이지 크기 (optional) (default to 20)
let startDate: string; //조회 시작 날짜 (YYYY-MM-DD) (optional) (default to undefined)
let endDate: string; //조회 종료 날짜 (YYYY-MM-DD) (optional) (default to undefined)
let sort: string; //정렬 (형식: property,asc|desc) (optional) (default to undefined)

const { status, data } = await apiInstance.getHistory(
    pageable,
    page,
    size,
    startDate,
    endDate,
    sort
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pageable** | **Pageable** |  | defaults to undefined|
| **page** | [**number**] | 페이지 번호 (0..N) | (optional) defaults to 0|
| **size** | [**number**] | 페이지 크기 | (optional) defaults to 20|
| **startDate** | [**string**] | 조회 시작 날짜 (YYYY-MM-DD) | (optional) defaults to undefined|
| **endDate** | [**string**] | 조회 종료 날짜 (YYYY-MM-DD) | (optional) defaults to undefined|
| **sort** | [**string**] | 정렬 (형식: property,asc|desc) | (optional) defaults to undefined|


### Return type

**OneToOneStudyHistoryPageResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json, */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

