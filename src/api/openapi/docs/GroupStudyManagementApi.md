# GroupStudyManagementApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**completeGroupStudy**](#completegroupstudy) | **PATCH** /api/v1/group-studies/{groupStudyId}/complete | 그룹스터디 종료|
|[**createGroupStudy**](#creategroupstudy) | **POST** /api/v1/group-studies | 그룹스터디 생성|
|[**deleteGroupStudy**](#deletegroupstudy) | **DELETE** /api/v1/group-studies/{groupStudyId} | 그룹스터디 삭제|
|[**getGroupStudies**](#getgroupstudies) | **GET** /api/v1/group-studies | 그룹스터디 목록 조회|
|[**getGroupStudy**](#getgroupstudy) | **GET** /api/v1/group-studies/{groupStudyId} | 그룹스터디 상세 조회|
|[**getMyGroupStudyApplications**](#getmygroupstudyapplications) | **GET** /api/v1/group-studies/applicants/{applicantId}/applies | 내가 신청한 그룹스터디 목록 조회|
|[**updateGroupStudyInfo**](#updategroupstudyinfo) | **PUT** /api/v1/group-studies/{groupStudyId} | 그룹스터디 정보 수정 (기본정보 + 상세정보 + 개설질문)|
|[**updateGroupStudyInterviewPost**](#updategroupstudyinterviewpost) | **PATCH** /api/v1/group-studies/{groupStudyId}/interview-post | 그룹스터디 개설질문 수정|

# **completeGroupStudy**
> completeGroupStudy()

그룹스터디 상태를 COMPLETED로 변경합니다.  [권한] - 🔐 로그인 필수 (ROLE_MEMBER) - 👤 해당 그룹스터디 리더만 가능

### Example

```typescript
import {
    GroupStudyManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyManagementApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)

const { status, data } = await apiInstance.completeGroupStudy(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 종료 성공 |  -  |
|**403** | 리더가 아님 |  -  |
|**404** | 그룹스터디 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createGroupStudy**
> createGroupStudy(groupStudyCreationRequestDto)

새로운 그룹스터디를 생성합니다.  **[권한]** - 🔐 **로그인 필수** (ROLE_MEMBER) - Bearer Token이 필요합니다. 

### Example

```typescript
import {
    GroupStudyManagementApi,
    Configuration,
    GroupStudyCreationRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyManagementApi(configuration);

let groupStudyCreationRequestDto: GroupStudyCreationRequestDto; //

const { status, data } = await apiInstance.createGroupStudy(
    groupStudyCreationRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyCreationRequestDto** | **GroupStudyCreationRequestDto**|  | |


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
|**201** | 그룹스터디 생성 성공 |  -  |
|**401** | Bearer Token is invalid or no bearer token |  -  |
|**403** | You are authenticated but not allowed authorization |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteGroupStudy**
> deleteGroupStudy()

그룹스터디를 삭제합니다. 본인이 생성한 그룹스터디만 삭제할 수 있습니다.

### Example

```typescript
import {
    GroupStudyManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyManagementApi(configuration);

let groupStudyId: number; //삭제할 그룹스터디 ID (default to undefined)

const { status, data } = await apiInstance.deleteGroupStudy(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 삭제할 그룹스터디 ID | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 삭제 성공 |  -  |
|**403** | 권한 없음 - 본인이 생성한 그룹스터디가 아님 |  -  |
|**404** | 그룹스터디를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getGroupStudies**
> PageResponseDto getGroupStudies()

모든 그룹스터디 목록을 조회합니다. 상태별 필터링이 가능합니다.  **[권한]** - 🌐 **비회원 접근 가능** - 로그인 없이 조회할 수 있습니다. 

### Example

```typescript
import {
    GroupStudyManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyManagementApi(configuration);

let page: number; //페이지 번호 (1부터 시작) (optional) (default to 1)
let pageSize: number; //페이지 크기 (optional) (default to 20)
let groupStudyStatus: 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED'; //스터디 상태 필터 (optional) (default to undefined)

const { status, data } = await apiInstance.getGroupStudies(
    page,
    pageSize,
    groupStudyStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] | 페이지 번호 (1부터 시작) | (optional) defaults to 1|
| **pageSize** | [**number**] | 페이지 크기 | (optional) defaults to 20|
| **groupStudyStatus** | [**&#39;RECRUITING&#39; | &#39;IN_PROGRESS&#39; | &#39;COMPLETED&#39;**]**Array<&#39;RECRUITING&#39; &#124; &#39;IN_PROGRESS&#39; &#124; &#39;COMPLETED&#39;>** | 스터디 상태 필터 | (optional) defaults to undefined|


### Return type

**PageResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getGroupStudy**
> GroupStudyFullResponseDto getGroupStudy()

특정 그룹스터디의 상세 정보를 조회합니다.  **[권한]** - 🌐 **비회원 접근 가능** - 로그인 없이 조회할 수 있습니다. 

### Example

```typescript
import {
    GroupStudyManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyManagementApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)

const { status, data } = await apiInstance.getGroupStudy(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

**GroupStudyFullResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMyGroupStudyApplications**
> PageResponseDto getMyGroupStudyApplications()

특정 신청자가 신청한 활성 그룹스터디 목록을 조회합니다. 삭제되지 않은 신청만 조회되며, 상태별 필터링이 가능합니다.  **[권한]** - 🌐 **비회원 접근 가능** - URL의 applicantId로 누구나 조회 가능합니다. 

### Example

```typescript
import {
    GroupStudyManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyManagementApi(configuration);

let applicantId: number; //신청자 ID (default to undefined)
let page: number; //페이지 번호 (1부터 시작) (optional) (default to 1)
let pageSize: number; //페이지 크기 (optional) (default to 20)
let applyStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXIT' | 'KICKED'; //신청 상태 필터 (선택사항) - PENDING, APPROVED, REJECTED, EXIT, KICKED 중 선택, 생략시 모든 상태 조회 (optional) (default to undefined)

const { status, data } = await apiInstance.getMyGroupStudyApplications(
    applicantId,
    page,
    pageSize,
    applyStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **applicantId** | [**number**] | 신청자 ID | defaults to undefined|
| **page** | [**number**] | 페이지 번호 (1부터 시작) | (optional) defaults to 1|
| **pageSize** | [**number**] | 페이지 크기 | (optional) defaults to 20|
| **applyStatus** | [**&#39;NONE&#39; | &#39;PENDING&#39; | &#39;APPROVED&#39; | &#39;REJECTED&#39; | &#39;EXIT&#39; | &#39;KICKED&#39;**]**Array<&#39;NONE&#39; &#124; &#39;PENDING&#39; &#124; &#39;APPROVED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;EXIT&#39; &#124; &#39;KICKED&#39;>** | 신청 상태 필터 (선택사항) - PENDING, APPROVED, REJECTED, EXIT, KICKED 중 선택, 생략시 모든 상태 조회 | (optional) defaults to undefined|


### Return type

**PageResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 활성 신청 목록 조회 성공 (삭제되지 않은 신청만 포함) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateGroupStudyInfo**
> updateGroupStudyInfo(groupStudyUpdateRequestDto)

그룹스터디의 기본 정보(타입, 모집인원, 진행방식 등), 상세 정보(제목, 설명, 요약, 썸네일), 개설질문을 한번에 수정합니다.  **[권한]** - 🔐 **로그인 필수** (ROLE_MEMBER) - 👤 **그룹스터디 리더만** 수정 가능 

### Example

```typescript
import {
    GroupStudyManagementApi,
    Configuration,
    GroupStudyUpdateRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyManagementApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let groupStudyUpdateRequestDto: GroupStudyUpdateRequestDto; //

const { status, data } = await apiInstance.updateGroupStudyInfo(
    groupStudyId,
    groupStudyUpdateRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyUpdateRequestDto** | **GroupStudyUpdateRequestDto**|  | |
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


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
|**200** | 수정 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateGroupStudyInterviewPost**
> updateGroupStudyInterviewPost(groupStudyInterviewPostRequestDto)

그룹스터디의 개설질문을 수정합니다.

### Example

```typescript
import {
    GroupStudyManagementApi,
    Configuration,
    GroupStudyInterviewPostRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyManagementApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let groupStudyInterviewPostRequestDto: GroupStudyInterviewPostRequestDto; //

const { status, data } = await apiInstance.updateGroupStudyInterviewPost(
    groupStudyId,
    groupStudyInterviewPostRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyInterviewPostRequestDto** | **GroupStudyInterviewPostRequestDto**|  | |
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


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
|**200** | 수정 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

