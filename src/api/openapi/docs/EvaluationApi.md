# EvaluationApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createEvaluation**](#createevaluation) | **POST** /api/v1/homeworks/{homeworkId}/evaluations | 과제 평가 생성|
|[**deleteEvaluation**](#deleteevaluation) | **DELETE** /api/v1/evaluations/{evaluationId} | 과제 평가 삭제|
|[**getEvaluation**](#getevaluation) | **GET** /api/v1/homeworks/{homeworkId}/evaluation | 과제 평가 조회|
|[**getMissionEvaluationGrades**](#getmissionevaluationgrades) | **GET** /api/v1/evaluations/grades | 미션 평가 등급 목록 조회|
|[**updateEvaluation**](#updateevaluation) | **PUT** /api/v1/evaluations/{evaluationId} | 과제 평가 수정|

# **createEvaluation**
> EvaluationCreationResponseSchema createEvaluation(evaluationRequest)

특정 과제에 대한 평가를 생성합니다.

### Example

```typescript
import {
    EvaluationApi,
    Configuration,
    EvaluationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new EvaluationApi(configuration);

let homeworkId: number; //과제 ID (default to undefined)
let evaluationRequest: EvaluationRequest; //

const { status, data } = await apiInstance.createEvaluation(
    homeworkId,
    evaluationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **evaluationRequest** | **EvaluationRequest**|  | |
| **homeworkId** | [**number**] | 과제 ID | defaults to undefined|


### Return type

**EvaluationCreationResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 평가 생성 성공 |  -  |
|**400** | 잘못된 요청 (유효하지 않은 등급, 중복 평가, 평가 기간 오류) |  -  |
|**403** | Illegal access to evaluation |  -  |
|**404** | 과제를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteEvaluation**
> NoContentResponse deleteEvaluation()

특정 과제 평가를 삭제합니다.

### Example

```typescript
import {
    EvaluationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EvaluationApi(configuration);

let evaluationId: number; //평가 ID (default to undefined)

const { status, data } = await apiInstance.deleteEvaluation(
    evaluationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **evaluationId** | [**number**] | 평가 ID | defaults to undefined|


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
|**204** | 평가 삭제 성공 |  -  |
|**403** | Illegal access to evaluation |  -  |
|**404** | 평가를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getEvaluation**
> EvaluationResponseSchema getEvaluation()

특정 과제에 대한 평가를 조회합니다.

### Example

```typescript
import {
    EvaluationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EvaluationApi(configuration);

let homeworkId: number; //과제 ID (default to undefined)

const { status, data } = await apiInstance.getEvaluation(
    homeworkId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **homeworkId** | [**number**] | 과제 ID | defaults to undefined|


### Return type

**EvaluationResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 평가 조회 성공 |  -  |
|**404** | 과제 또는 평가를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMissionEvaluationGrades**
> GradeListResponseSchema getMissionEvaluationGrades()

미션 평가에 사용 가능한 등급 목록을 조회합니다.

### Example

```typescript
import {
    EvaluationApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EvaluationApi(configuration);

const { status, data } = await apiInstance.getMissionEvaluationGrades();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GradeListResponseSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 등급 목록 조회 성공 |  -  |
|**500** | 서버 내부 오류 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateEvaluation**
> NoContentResponse updateEvaluation(evaluationRequest)

기존 과제 평가의 등급과 댓글을 수정합니다.

### Example

```typescript
import {
    EvaluationApi,
    Configuration,
    EvaluationRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new EvaluationApi(configuration);

let evaluationId: number; //평가 ID (default to undefined)
let evaluationRequest: EvaluationRequest; //

const { status, data } = await apiInstance.updateEvaluation(
    evaluationId,
    evaluationRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **evaluationRequest** | **EvaluationRequest**|  | |
| **evaluationId** | [**number**] | 평가 ID | defaults to undefined|


### Return type

**NoContentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 평가 수정 성공 |  -  |
|**400** | 잘못된 요청 (유효하지 않은 등급 또는 댓글 길이 초과) |  -  |
|**403** | Illegal access to evaluation |  -  |
|**404** | 평가를 찾을 수 없음 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

