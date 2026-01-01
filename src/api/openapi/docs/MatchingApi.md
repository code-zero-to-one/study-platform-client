# MatchingApi

All URIs are relative to *https://test-api.zeroone.it.kr*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**applyForStudyMatching**](#applyforstudymatching) | **POST** /api/v1/matching/apply | CS 스터디 매칭 신청|
|[**getMatchingSystemStatus**](#getmatchingsystemstatus) | **GET** /api/v1/matching/system-status | 매칭 시스템 현재 상태 조회|

# **applyForStudyMatching**
> BaseResponse applyForStudyMatching(requestAutoStudyMatchingDto)

사용자가 CS 스터디 매칭을 위해 정보를 입력하고 신청합니다. 요청 본문에는 멤버id, 자기소개, 스터디 계획, 선호 주제, 가능 시간대, 기술 스택, 연락처, GitHub/SNS URL 등이 포함됩니다.

### Example

```typescript
import {
    MatchingApi,
    Configuration,
    RequestAutoStudyMatchingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new MatchingApi(configuration);

let requestAutoStudyMatchingDto: RequestAutoStudyMatchingDto; //CS 스터디 매칭 신청 화면에서 매칭 신청 확인 버튼을 누를때 사용할 Api입니다.  CS 스터디 매칭 신청 화면을 불러올때는 테크스택 id 리스트 조회와 가능 시간대 id 리스트 조회가 필요합니다.

const { status, data } = await apiInstance.applyForStudyMatching(
    requestAutoStudyMatchingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestAutoStudyMatchingDto** | **RequestAutoStudyMatchingDto**| CS 스터디 매칭 신청 화면에서 매칭 신청 확인 버튼을 누를때 사용할 Api입니다.  CS 스터디 매칭 신청 화면을 불러올때는 테크스택 id 리스트 조회와 가능 시간대 id 리스트 조회가 필요합니다. | |


### Return type

**BaseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Forbidden |  -  |
|**201** | CS 스터디 매칭 신청 성공 |  -  |
|**400** | 잘못된 요청 (입력 값 유효성 오류, 필수 필드 누락 등) |  -  |
|**401** | 인증 실패 (유효하지 않은 토큰 등) |  -  |
|**500** | 서버 내부 오류 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMatchingSystemStatus**
> MatchingSystemStatusSchema getMatchingSystemStatus()

현재 매칭 시스템의 상태를 조회합니다. (RECRUITING: 모집중, STUDYING: 스터디 진행중)

### Example

```typescript
import {
    MatchingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new MatchingApi(configuration);

const { status, data } = await apiInstance.getMatchingSystemStatus();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**MatchingSystemStatusSchema**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*, application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**403** | Forbidden |  -  |
|**200** | 조회 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

