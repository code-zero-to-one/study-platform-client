# GroupStudyApplyApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**applyGroupStudy**](#applygroupstudy) | **POST** /api/v1/group-studies/{groupStudyId}/apply | 그룹스터디 신청|
|[**cancelGroupStudyApply**](#cancelgroupstudyapply) | **DELETE** /api/v1/group-studies/{groupStudyId}/apply/{applyId} | 그룹스터디 신청 취소|
|[**findGroupStudyApplicantsByGroupStudy**](#findgroupstudyapplicantsbygroupstudy) | **GET** /api/v1/group-studies/{groupStudyId}/applies | 그룹스터디별 신청자 목록 조회|
|[**getGroupStudyApplyDetail**](#getgroupstudyapplydetail) | **GET** /api/v1/group-studies/{groupStudyId}/apply | 그룹스터디 신청 정보 조회|
|[**processGroupStudyApply**](#processgroupstudyapply) | **PATCH** /api/v1/group-studies/{groupStudyId}/apply/{applyId}/process | 그룹스터디 신청 승인/거절|
|[**updateGroupStudyApply**](#updategroupstudyapply) | **PUT** /api/v1/group-studies/{groupStudyId}/apply/{applyId} | 그룹스터디 신청 수정|

# **applyGroupStudy**
> GroupStudyApplyResponse applyGroupStudy(groupStudyApplyRequest)

새로운 그룹스터디에 신청합니다.  **[권한]** - 🔐 **로그인 필수** (ROLE_MEMBER) - Bearer Token이 필요합니다. 

### Example

```typescript
import {
    GroupStudyApplyApi,
    Configuration,
    GroupStudyApplyRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyApplyApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let groupStudyApplyRequest: GroupStudyApplyRequest; //

const { status, data } = await apiInstance.applyGroupStudy(
    groupStudyId,
    groupStudyApplyRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyApplyRequest** | **GroupStudyApplyRequest**|  | |
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

**GroupStudyApplyResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 신청 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **cancelGroupStudyApply**
> NoContentResponse cancelGroupStudyApply()

기존 그룹스터디 신청을 취소합니다.  **[권한]** - 🔐 **로그인 필수** (ROLE_MEMBER) - 👤 **본인이 작성한 신청만** 취소 가능 

### Example

```typescript
import {
    GroupStudyApplyApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyApplyApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let applyId: number; //신청 ID (default to undefined)

const { status, data } = await apiInstance.cancelGroupStudyApply(
    groupStudyId,
    applyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **applyId** | [**number**] | 신청 ID | defaults to undefined|


### Return type

**NoContentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | 취소 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **findGroupStudyApplicantsByGroupStudy**
> GroupStudyApplyListResponse findGroupStudyApplicantsByGroupStudy()

특정 그룹스터디에 신청한 활성 신청자 목록을 조회합니다. (삭제되지 않은 신청만 조회)  **[권한]** - 🌐 **비회원 접근 가능** - 로그인 없이 조회할 수 있습니다. 

### Example

```typescript
import {
    GroupStudyApplyApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyApplyApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let page: number; //페이지 번호 (1부터 시작) (optional) (default to 1)
let pageSize: number; //페이지 크기 (optional) (default to 20)
let applyStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXIT' | 'KICKED'; //신청 상태 (선택사항) - PENDING, APPROVED, REJECTED, EXIT, KICKED 중 선택 (optional) (default to undefined)

const { status, data } = await apiInstance.findGroupStudyApplicantsByGroupStudy(
    groupStudyId,
    page,
    pageSize,
    applyStatus
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **page** | [**number**] | 페이지 번호 (1부터 시작) | (optional) defaults to 1|
| **pageSize** | [**number**] | 페이지 크기 | (optional) defaults to 20|
| **applyStatus** | [**&#39;NONE&#39; | &#39;PENDING&#39; | &#39;APPROVED&#39; | &#39;REJECTED&#39; | &#39;EXIT&#39; | &#39;KICKED&#39;**]**Array<&#39;NONE&#39; &#124; &#39;PENDING&#39; &#124; &#39;APPROVED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;EXIT&#39; &#124; &#39;KICKED&#39;>** | 신청 상태 (선택사항) - PENDING, APPROVED, REJECTED, EXIT, KICKED 중 선택 | (optional) defaults to undefined|


### Return type

**GroupStudyApplyListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 활성 신청자 목록 조회 성공 (삭제되지 않은 신청만 포함) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getGroupStudyApplyDetail**
> GroupStudyApplyDetailResponse getGroupStudyApplyDetail()

자신의 그룹스터디 신청 정보를 조회합니다.  **[권한]** - 🔐 **로그인 필수** (ROLE_MEMBER) - 본인의 신청 정보만 조회할 수 있습니다. 

### Example

```typescript
import {
    GroupStudyApplyApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyApplyApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)

const { status, data } = await apiInstance.getGroupStudyApplyDetail(
    groupStudyId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|


### Return type

**GroupStudyApplyDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 그룹스터디 신청 정보 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **processGroupStudyApply**
> GroupStudyApplyProcessResponse processGroupStudyApply(groupStudyApplyProcessRequest)

그룹스터디 신청을 승인/거절합니다.  **[권한]** - 🔐 **로그인 필수** (ROLE_MEMBER) - 👤 **그룹스터디 리더만** 처리 가능 

### Example

```typescript
import {
    GroupStudyApplyApi,
    Configuration,
    GroupStudyApplyProcessRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyApplyApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let applyId: number; //신청 ID (default to undefined)
let groupStudyApplyProcessRequest: GroupStudyApplyProcessRequest; //

const { status, data } = await apiInstance.processGroupStudyApply(
    groupStudyId,
    applyId,
    groupStudyApplyProcessRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyApplyProcessRequest** | **GroupStudyApplyProcessRequest**|  | |
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **applyId** | [**number**] | 신청 ID | defaults to undefined|


### Return type

**GroupStudyApplyProcessResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 처리 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateGroupStudyApply**
> GroupStudyUpdateResponse updateGroupStudyApply(groupStudyApplyUpdateRequest)

기존 그룹스터디 신청 내용을 수정합니다.  **[권한]** - 🔐 **로그인 필수** (ROLE_MEMBER) - 👤 **본인이 작성한 신청만** 수정 가능 

### Example

```typescript
import {
    GroupStudyApplyApi,
    Configuration,
    GroupStudyApplyUpdateRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new GroupStudyApplyApi(configuration);

let groupStudyId: number; //그룹스터디 ID (default to undefined)
let applyId: number; //신청 ID (default to undefined)
let groupStudyApplyUpdateRequest: GroupStudyApplyUpdateRequest; //

const { status, data } = await apiInstance.updateGroupStudyApply(
    groupStudyId,
    applyId,
    groupStudyApplyUpdateRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **groupStudyApplyUpdateRequest** | **GroupStudyApplyUpdateRequest**|  | |
| **groupStudyId** | [**number**] | 그룹스터디 ID | defaults to undefined|
| **applyId** | [**number**] | 신청 ID | defaults to undefined|


### Return type

**GroupStudyUpdateResponse**

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

