# MissionApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createMission**](#createmission) | **POST** /api/v1/group-studies/{groupStudyId}/missions | 그룹스터디 미션 생성|
|[**deleteMission**](#deletemission) | **DELETE** /api/v1/missions/{missionId} | 미션 삭제|
|[**getMission**](#getmission) | **GET** /api/v1/missions/{missionId} | 그룹스터디 미션 조회|
|[**getMissions**](#getmissions) | **GET** /api/v1/group-studies/{groupStudyId}/missions | 그룹스터디 미션 목록 조회|
|[**updateMission**](#updatemission) | **PUT** /api/v1/missions/{missionId} | 그룹스터디 미션 수정|

# **createMission**
> CreateMissionResponseSchema createMission(missionCreationRequest)

그룹스터디 리더가 새로운 미션을 생성합니다.  **[권한]** - 인증된 사용자만 접근 가능 - 그룹스터디 리더 권한 필요  **[Request]** - PathVariable: groupStudyId (필수) - 그룹스터디 ID - RequestBody: MissionCreationRequest (필수)   - title (필수): 미션 제목   - description (선택): 미션 설명   - guide (필수): 미션 가이드   - startTime (필수): 미션 시작 시간 (현재 또는 미래)   - endTime (필수): 미션 종료 시간 (현재 또는 미래)  **[Response]** - MissionCreationResult: 생성된 미션 ID - Location 헤더: /missions/{missionId} 

### Example

```typescript
import {
    MissionApi,
    Configuration,
    MissionCreationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MissionApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let missionCreationRequest: MissionCreationRequest; //미션 생성 요청 정보

const { status, data } = await apiInstance.createMission(
    groupStudyId,
    missionCreationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **missionCreationRequest** | **MissionCreationRequest**| 미션 생성 요청 정보 | |
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

**CreateMissionResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 미션 생성 성공 |  -  |
|**400** | 잘못된 요청 (validation 실패 또는 미션 생성 실패) |  -  |
|**403** | Mission creator not leader (MIS006) |  -  |
|**404** | 그룹스터디를 찾을 수 없음 (GSM001) |  -  |
|**409** | 미션 기간 중복 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteMission**
> NoContentResponse deleteMission()

특정 미션을 삭제합니다.

### Example

```typescript
import {
    MissionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MissionApi(configuration);

let missionId: number; //미션 ID (default to undefined)

const { status, data } = await apiInstance.deleteMission(
    missionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **missionId** | [**number**] | 미션 ID | defaults to undefined|


### Return type

**NoContentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 미션 삭제 성공 |  -  |
|**400** | 미션 삭제 실패 - 미션이 이미 시작됨 (MIS003) |  -  |
|**403** | 미션에 대한 불법적인 접근 (MIS007) |  -  |
|**404** | 미션을 찾을 수 없음 (MIS002) |  -  |
|**409** | 미션 기간 중복 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMission**
> MissionResponse getMission()

미션 ID를 통해 특정 미션의 상세 정보를 조회합니다.  **[권한]** - 인증된 사용자만 접근 가능  **[Request]** - PathVariable: missionId (필수) - 미션 ID 

### Example

```typescript
import {
    MissionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MissionApi(configuration);

let missionId: number; //미션 ID (default to undefined)

const { status, data } = await apiInstance.getMission(
    missionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **missionId** | [**number**] | 미션 ID | defaults to undefined|


### Return type

**MissionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 미션 조회 성공 |  -  |
|**404** | 미션을 찾을 수 없음 (MIS002) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMissions**
> MissionListResponseSchema getMissions()

특정 그룹스터디의 미션 목록을 페이지네이션으로 조회합니다.  **[Request]** - PathVariable: groupStudyId (필수) - 그룹스터디 ID - QueryParam: page (선택, 기본값: 1) - 페이지 번호 (1부터 시작) - QueryParam: size (선택, 기본값: 10) - 페이지 크기  **[Response]** - PageResponseDto<MissionListResponse>: 미션 목록과 페이지 정보 - 각 미션 정보: id, title, startTime, endTime, status 

### Example

```typescript
import {
    MissionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MissionApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let searchType: 'ALL' | 'COMPLETED_MISSION' | 'IN_PROGRESS_MISSION'; //검색 타입 - 진행 중인 미션 혹은 완료된 미션 (default to undefined)
let page: number; //페이지 번호 (1부터 시작, 기본값: 1) (optional) (default to 1)
let pageSize: number; //페이지 크기 (기본값: 10) (optional) (default to 10)

const { status, data } = await apiInstance.getMissions(
    groupStudyId,
    searchType,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **searchType** | [**&#39;ALL&#39; | &#39;COMPLETED_MISSION&#39; | &#39;IN_PROGRESS_MISSION&#39;**]**Array<&#39;ALL&#39; &#124; &#39;COMPLETED_MISSION&#39; &#124; &#39;IN_PROGRESS_MISSION&#39;>** | 검색 타입 - 진행 중인 미션 혹은 완료된 미션 | defaults to undefined|
| **page** | [**number**] | 페이지 번호 (1부터 시작, 기본값: 1) | (optional) defaults to 1|
| **pageSize** | [**number**] | 페이지 크기 (기본값: 10) | (optional) defaults to 10|


### Return type

**MissionListResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 미션 목록 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateMission**
> UpdateMissionResponseSchema updateMission(missionUpdateRequest)

그룹스터디 리더가 기존 미션을 수정합니다.  **[권한]** - 인증된 사용자만 접근 가능 - 그룹스터디 리더 권한 필요  **[Request]** - PathVariable: missionId (필수) - 미션 ID - RequestBody: MissionUpdateRequest (필수)   - title (필수): 미션 제목   - description (선택): 미션 설명   - guide (필수): 미션 가이드   - startTime (필수): 미션 시작 시간   - endTime (필수): 미션 종료 시간  **[Response]** - 204 No Content: 수정 성공 시 응답 본문 없음 

### Example

```typescript
import {
    MissionApi,
    Configuration,
    MissionUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new MissionApi(configuration);

let missionId: number; //미션 ID (default to undefined)
let missionUpdateRequest: MissionUpdateRequest; //미션 수정 요청 정보

const { status, data } = await apiInstance.updateMission(
    missionId,
    missionUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **missionUpdateRequest** | **MissionUpdateRequest**| 미션 수정 요청 정보 | |
| **missionId** | [**number**] | 미션 ID | defaults to undefined|


### Return type

**UpdateMissionResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 미션 수정 성공 |  -  |
|**400** | 잘못된 요청 (validation 실패, 미션 수정 실패, 또는 파라미터 검증 실패) |  -  |
|**403** | 미션에 대한 비인가 접근 (MIS007) |  -  |
|**404** | 미션을 찾을 수 없음 (MIS002) |  -  |
|**409** | 미션 기간 중복 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

